// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 150, left: 175};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 250;
let graph_4_width = MAX_WIDTH / 2, graph_4_height = 275;


const svg1 = d3.select("#graph1")
.append("svg")
  .attr("width", graph_1_width + margin.left + margin.right)
  .attr("height", graph_1_height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

data = d3.csv("data/netflix.csv")

data.then(data =>  {
  newdata = {}
  for (i=0; i < data.length; i++) {
    try {
      genres = data[i].listed_in.split(", ")
      for (j=0; j<genres.length; j++) {
        if (!(newdata[genres[j]] > 0)) {
          newdata[genres[j]] = 1
        } else {
          newdata[genres[j]] += 1
        }
      }
    } catch {
    }
  }
  newnewdata= []
  xdomain = []
  for (k in newdata) {
    newnewdata.push({'genre' : k, 'count' : newdata[k]})
    xdomain.push(k)
  }

  const yaxis = d3.scaleLinear()
  .range([ graph_1_height, 0])
  .domain([0, 2000]);
  svg1.append("g")
    .call(d3.axisLeft(yaxis));
  svg1.append("text")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("transform", "translate(-50,30)rotate(-90)")
    .text("Count");

  const xaxis = d3.scaleBand()
    .domain(xdomain)
    .range([ 0, graph_1_width ])
  svg1.append("g")
    .attr("transform", "translate(0," + graph_1_height + ")")
    .call(d3.axisBottom(xaxis))
    .selectAll("text")
      .attr("transform", "translate(-12,10)rotate(-90)")
      .style("text-anchor", "end");

  svg1.selectAll("mybar")
    .data(newnewdata)
    .enter()
    .append("rect")
      .attr("x", (x) => xaxis(x['genre']))
      .attr("width", xaxis.bandwidth())
      .attr("y", (y) => yaxis(y['count']))
      .attr("height", (y) => graph_1_height - yaxis(y['count']))
      .attr("fill", "blue")
});



// second graph: runtimes by release year
const svg3 = d3.select("#graph3")
  .append("svg")
    .attr("width", graph_3_width + margin.left + margin.right)
    .attr("height", graph_3_height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

data.then((data) => {
  newdata = {}
  for (i=0; i < data.length; i++) {
    try {
      year = data[i].release_year
      if (data[i].type == "Movie") {
        dur = parseInt(data[i].duration.slice(0, -4))
        try { 
          check = newdata[year]
          newdata[year][0] += dur
          newdata[year][1] += 1
         }
        catch {
          newdata[year] = [dur, 1]
        }
      }
    } catch {
    }
  }

  newnewdata= []
  xdomain = []
  for (k in newdata) {
    newnewdata.push({'year' : k, 'dur' : newdata[k][0] / newdata[k][1]})
    xdomain.push(k)
  }

  const yaxis = d3.scaleLinear()
  .range([ graph_3_height, 0])
  .domain([0, 250]);
  svg3.append("g")
    .call(d3.axisLeft(yaxis));
  svg3.append("text")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("transform", "translate(-50,30)rotate(-90)")
    .text("Average Runtime");

  const xaxis = d3.scaleBand()
    .domain(xdomain)
    .range([ 0, graph_3_width ])
  svg3.append("g")
    .attr("transform", "translate(0," + graph_3_height + ")")
    .call(d3.axisBottom(xaxis))
    .selectAll("text")
      .attr("transform", "translate(-12,10)rotate(-90)")
      .style("text-anchor", "end");

  svg3.selectAll("mybar")
    .data(newnewdata)
    .enter()
    .append("rect")
      .attr("x", (x) => xaxis(x['year']))
      .attr("width", xaxis.bandwidth())
      .attr("y", (y) => yaxis(y['dur']))
      .attr("height", (y) => graph_3_height - yaxis(y['dur']))
      .attr("fill", "green")
});

// third graph: flow chart
const svg4 = d3.select("#graph4")
.append("svg")
  .attr("width", graph_4_width)
  .attr("height", graph_4_height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

data.then( (data) => {

  actorCounts = {}
  for (i=0; i < data.length; i++) {
    actors = data[i].cast.split(", ")
    for (j=0; j<actors.length; j++) {
      if (actors[j] != "") {
      if (!(actorCounts[actors[j]] > 0)) {
        actorCounts[actors[j]] = 1
      } else {
        actorCounts[actors[j]] += 1
      }
    }
    }
  }

  nodes = []
  seen = []
  let count = 1
  for (i=0; i < data.length; i++) {
    try {
      actors = data[i].cast.split(", ")
      for (j=0; j<actors.length; j++) {
        if (actorCounts[actors[j]] > 20 && actors[j] != "") {
          if (!seen.includes(actors[j])) {
            seen.push(actors[j])
            nodes.push({'id': count, 'name':actors[j]})
            count += 1
          }
        }  
      }
    } catch {
    }
  }

  links = []
  seen2 = []
  for (i=0; i < data.length; i++) {
    try {
      actors = data[i].cast.split(", ")
      for (j=0; j<actors.length; j++) {
        for (k=j+1; k<actors.length; k++) {
          if (actorCounts[actors[j]] > 20 && actorCounts[actors[k]] > 20) {
            if (!(seen2.includes(actors[j]+":"+actors[k]))) {
              seen2.push(actors[j]+":"+actors[k])
              links.push({'source': actors[j], 'target':actors[k]})
            }
          }
        }
      }
    } catch {
    }
  }

  console.log(nodes)
  console.log(links)

});
