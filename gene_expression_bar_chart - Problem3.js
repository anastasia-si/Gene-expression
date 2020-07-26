/**
 * Sorting functionality. Sort the data by:
 * Tissue name, ascending alphabetically
 * Median gene expression, descending by value
 */

(function () {

  // chart settings
  const svg_width = 1200;
  const svg_height = 500;
  margin = { top: 50, right: 20, bottom: 200, left: 80 },
    width = svg_width - margin.left - margin.right,
    height = svg_height - margin.top - margin.bottom;
  const containerId = "#problem3";
  const chartTitle = "Problem 3: Median expression value by tissue"
  const sort_options = {
    tissue: { field: 'tissueSiteDetailId', order: 1 }, //  1 - ascending. Tissue name, ascending alphabetically 
    median: { field: 'medianValue', order: -1 }        // -1 - descending. Median gene expression, descending by value
  };

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
      .attr("class", "axis axis-x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-1em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    // add the y Axis
    svg.append("g")
      .attr("class", "axis axis-y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "-3em");

    // sorting
    var sortFieldDropdown = document.querySelector('.sortFieldDropdown');
    $(sortFieldDropdown).on("change", handleChangeSortField);

    function handleChangeSortField() {
      
      const sort_field = sort_options[this.value].field;
      const sort_order = sort_options[this.value].order;

      var sorted = data.sort(function (a, b) {
        if (a[sort_field] < b[sort_field]) {
          return -1 * sort_order;
        }
        if (a[sort_field] > b[sort_field]) {
          return 1 * sort_order;
        }
        return 0;
      });

      // compute the new positions
      x.domain(sorted.map(function (d) {
        return d.tissueSiteDetailId;
      }))

      // reorder the bar elements
      svg.selectAll("rect")
        .sort(function (a, b) {
          if (a[sort_field] < b[sort_field]) {
            return -1 * sort_order;
          }
          if (a[sort_field] > b[sort_field]) {
            return 1 * sort_order;
          }
          return 0;
        });

      // transition the bar elements and labels to the new positions 
      var transition = svg.transition().duration(500),
        delay = function (d, i) {
          return i * 50;
        };

      transition.selectAll("rect")
        .attr("x", function (d) { return x(d.tissueSiteDetailId); })

      transition.select(".axis.axis-x")
        .call(d3.axisBottom(x))
        .delay(delay);      
    }

  }).catch(function (err) {
    return console.error(err);
  })

})();
