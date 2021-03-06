/**
 * Use tissue colors from the tissue_info.json​ file
 * as the color for each corresponding bar
 */

(function () {

  // chart settings
  const svg_width = 1200;
  const svg_height = 500;
  const margin = { top: 50, right: 20, bottom: 200, left: 80 },
    width = svg_width - margin.left - margin.right,
    height = svg_height - margin.top - margin.bottom;
  const containerId = "#problem2";
  const chartTitle = "Problem 2: Median expression value by tissue"

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
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // title    
  svg.append("text")
    .attr("transform", "translate(100,-20)")
    .attr("class", "chart-title")
    .text(chartTitle)


  Promise.all([
    d3.json("PTEN_gene_expression.json"),
    d3.json("tissue_info.json")
  ]).then(function (files) {

    const exprArr = files[0].geneExpression;
    const tissueInfoArr = files[1].tissueInfo;

    // use Lodash library to group tissue data by 'tissueSiteDetailId'
    let tissueInfo = _.keyBy(tissueInfoArr, 'tissueSiteDetailId');

    data = _
      .chain(exprArr)
      .groupBy('tissueSiteDetailId')
      .map((tissueValue, tissueKey) =>
        ({
          tissueSiteDetailId: tissueKey.replace(/_/g, " "),  // remove '_' from tissue labels
          medianValue: median(_.map(tissueValue, 'data')),   // median function from help.js
          color: tissueInfo[tissueKey].colorHex              // use tissue color as the color for each corresponding bar
        })
      )
      .value();

    x.domain(data.map(function (d) { return d.tissueSiteDetailId; }));
    y.domain([0, d3.max(data, function (d) { return d.medianValue; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".color-bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "color-bar")
      .attr("x", function (d) { return x(d.tissueSiteDetailId); })
      .attr("y", function (d) { return y(d.medianValue); })
      .attr("width", x.bandwidth())
      .attr("height", function (d) { return height - y(d.medianValue); })
      .attr("fill", function (d) { return '#' + d.color; });
    
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
      .attr("dy", "-3em");

  }).catch(function (err) {
    return console.error(err);
  })


})();