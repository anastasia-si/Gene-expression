/**
 * Parse the expression data from the PTEN_gene_expression.json file.
 * Using d3.js, plot the median expression value of each
 * tissue as a bar chart.
 */


(function () {

  // chart settings
  const svg_width = 1200;
  const svg_height = 500;
  const margin = { top: 50, right: 20, bottom: 200, left: 80 },
    width = svg_width - margin.left - margin.right,
    height = svg_height - margin.top - margin.bottom;
  const containerId = "#problem1";
  const chartTitle = "Problem 1: Median expression value by tissue"


  // ranges
  const x = d3.scaleBand()
    .range([0, width])
    .padding(0.2);
  const y = d3.scaleLinear()
    .range([height, 0]);

  let svg = d3.select(containerId).append("svg")
    .attr("width", svg_width)
    .attr("height", svg_height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // title  
  svg.append("text")
    .attr("transform", "translate(100,-20)")
    .attr("class", "chart-title")
    .text(chartTitle)

  
  d3.json("PTEN_gene_expression.json")
    .then(function (data) {
      let exprArr = data.geneExpression;

      // use Lodash library to process data 
      data = _
        .chain(exprArr)
        .groupBy('tissueSiteDetailId')   // create an object that has keys where each each key is tissueSiteDetailId
        .map((tissueValue, tissueKey) =>
          ({
            tissueSiteDetailId: tissueKey.replace(/_/g, " "),  // remove '_' from tissue labels for readability
            medianValue: median(_.map(tissueValue, 'data'))    // median function from help.js
          })
        )
        .value();

      x.domain(data.map(function (d) { return d.tissueSiteDetailId; }));
      y.domain([0, d3.max(data, function (d) { return d.medianValue; })]);

      // append the rectangles for the column chart
      svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return x(d.tissueSiteDetailId); })
        .attr("y", function (d) { return y(d.medianValue); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(d.medianValue); });

      // data labels
        svg.selectAll(".text")  		
        .data(data)
        .enter()
        .append("text")
        .attr("class","label")
        .attr("x", (function(d) { return x(d.tissueSiteDetailId) + 2; }  )) 
        .attr("y", function(d) { return y(d.medianValue) - 10; })
        .attr("dy", "0.75em")
        .text(function(d) { return Math.round(d.medianValue); });

      // x Axis
      svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-1em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

      // y Axis
      svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "-3em")
        .text("Median");
    })
    .catch(function (error) {
      return console.error(err);
    });

})();