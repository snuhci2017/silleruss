/**
 * Created by Dragon on 2017-06-14.
 */
var svg = dimple.newSvg("#chartContainer", 590, 400);
d3.tsv("data/Jun_14_2017.tsv", function (data) {
    // Latest period only
    dimple.filterData(data, "Date", "01/12/2012");
    // Create the chart
    var myChart = new dimple.chart(svg, data);
    myChart.setBounds(60, 30, 420, 330)

    // Create a standard bubble of SKUs by PM10 and PM2.5
    // We are coloring by Si-do as that will be the key in the legend
    myChart.addMeasureAxis("x", "PM10");
    myChart.addMeasureAxis("y", "PM2.5");
    myChart.addSeries(["id", "Gu-gun", "Si-do"], dimple.plot.bubble);
    var myLegend = myChart.addLegend(530, 100, 60, 300, "Right");
    myChart.draw();

    // This is a critical step.  By doing this we orphan the legend. This
    // means it will not respond to graph updates.  Without this the legend
    // will redraw when the chart refreshes removing the unchecked item and
    // also dropping the events we define below.
    myChart.legends = [];

    // This block simply adds the legend title. I put it into a d3 data
    // object to split it onto 2 lines.  This technique works with any
    // number of lines, it isn't dimple specific.
    svg.selectAll("title_text")
        .data(["Click legend to","show/hide owners:"])
        .enter()
        .append("text")
        .attr("x", 490)
        .attr("y", function (d, i) { return 90 + i * 14; })
        .style("font-family", "sans-serif")
        .style("font-size", "10px")
        .style("color", "Black")
        .text(function (d) { return d; });

    // Get a unique list of Si-do values to use when filtering
    var filterValues = dimple.getUniqueValues(data, "Si-do");
    // Get all the rectangles from our now orphaned legend
    myLegend.shapes.selectAll("rect")
    // Add a click event to each rectangle
        .on("click", function (e) {
            // This indicates whether the item is already visible or not
            var hide = false;
            var newFilters = [];
            // If the filters contain the clicked shape hide it
            filterValues.forEach(function (f) {
                if (f === e.aggField.slice(-1)[0]) {
                    hide = true;
                } else {
                    newFilters.push(f);
                }
            });
            // Hide the shape or show it
            if (hide) {
                d3.select(this).style("opacity", 0.2);
            } else {
                newFilters.push(e.aggField.slice(-1)[0]);
                d3.select(this).style("opacity", 0.8);
            }
            // Update the filters
            filterValues = newFilters;
            // Filter the data
            myChart.data = dimple.filterData(data, "Si-do", filterValues);
            // Passing a duration parameter makes the chart animate. Without
            // it there is no transition
            myChart.draw(800);
        });
});