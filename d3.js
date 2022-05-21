(function () {

  // Margin convention
  const margin = { top: 10, right: 50, bottom: 50, left: 50 }
  const width = 600 - margin.left - margin.right
  const height = 425 - margin.top - margin.bottom

  const svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


  // Color scale based on price per sq ft
  const colorScale = d3.scaleOrdinal()
        .domain([1,2])
        .range(["#FF0000","#6495ED"]) 

  // Set radius scale
  const radiusScale = d3.scaleSqrt()
    .domain([0, 700])
    .range([0, 100])

  // Define years
  const years = [2012]

  // Define set
  const set = [1,2]

  // Define x axis position
  const xPositionScale = d3.scalePoint()
    .domain(years)
    .range([140, width - 110])

  // Create tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");
  
  // Force simulation and prevent overlap
  const forceX = d3.forceX(xPositionScale(years)).strength(1)
  const forceY = d3.forceY(150).strength(1)
  const forceCollide = d3.forceCollide((d => radiusScale(d.Percentage)))
  const simulation = d3.forceSimulation()
    .force("overlap", forceCollide)
    .force("y", forceY)
    .force("x", forceX)
    .force('charge', d3.forceManyBody().strength(-500))

  d3.dsv(",","rental.csv")
    .then(ready)
  function ready (datapoints) {
    datapoints.forEach(d => {
      d.x = xPositionScale(2021);
      d.y = 0;
    })

  // Set position of circles
    svg.selectAll('circle')
      .data(datapoints)
      .join('circle')
      .attr("id", "circleBasicTooltip")
      .attr('r', d => radiusScale(d.Percentage))
      .attr('cx', d => xPositionScale(years))
      .attr('fill', d => colorScale(d.set))
      .attr('cy', 200)
      .attr('stroke-width', 2)
      .attr("stroke", "black")

  // Trigger tooltip
    d3.selectAll("circle")
      .on("mouseover", function(e, d) {
        d3.select(this)
          .attr('stroke-width', '3')
          .attr("stroke", "black");
        tooltip
          .style("visibility", "visible")
          .attr('class','tooltipdiv')
          .html(`<h4><strong>${d.City}</strong></h4>` + 
                `<p><strong>Percentage</strong>: ${d.Percentage}%<br />`);
      })
      .on("mousemove", function(e) {
        tooltip
          .style("top", e.pageY - 10 + "px")
          .style("left", e.pageX + 10 + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr('stroke-width', 2);
          tooltip.style("visibility", "hidden");
    });


    simulation.nodes(datapoints)
      .on('tick', ticked)
    function ticked() {
      svg.selectAll('circle')
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)      
    }
  }
})();

// Create our number formatter.
var formatter = new Intl.NumberFormat('en-US', {
  notation : 'compact',
  style: 'currency',
  currency: 'USD',
});