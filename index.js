/**
 * IMPORTANT NOTICE:
 * 
 * The data is provided by the data.js file.
 * Make sure the data.js file is loaded before the index.js file, so that you can access it here!
 * The data is provided in an array called: data
 * const data = [
  {
    "species": "Adelie",
    "island": "Torgersen",
    "culmen_length_mm": 39.1,
    "culmen_depth_mm": 18.7,
    "flipper_length_mm": 181,
    "body_mass_g": 3750,
    "sex": "MALE"
  } ....
 */

console.log("Initial Data", data)

// constants
const width = 600;
const height = 600;
const margin = {
  left: 50,
  right: 50,
  top: 50,
  bottom: 50,
};

d3.select('svg#chart').attr('width', width).attr('height', height)
d3.select('g#vis-g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

const visHeight = height - margin.top - margin.bottom
const visWidth = width - margin.left - margin.right

//TASK: get all dimensions in the dataset
var allDimensions = Object.keys(data[0]);

console.log("Dimensions of the dataset: ", allDimensions)

//TASK: Data cleaning
// filter out any datapoints where a value is undefined
// 334 datapoints should remain
var cleanData = [];

data.forEach(datapoint => {
  if (!Object.values(datapoint).includes(undefined)) {
    cleanData.push(datapoint);
  }
});

console.log("cleaned Data:", cleanData.map(d => d.sex))

//TASK: seperate numeric and ordinal dimensions
var cl = "culmen_length_mm";
var cd = "culmen_depth_mm";
var fl = "flipper_length_mm";
var bm = "body_mass_g";
var sp = "species";
var is = "island";
var sx = "sex";

var numerics = {culmen_length_mm: [], culmen_depth_mm: [], flipper_length_mm: [], body_mass_g: []}
var categoricals = {species: [], island: [], sex: []}

cleanData.forEach(datapoint => {
  numerics.culmen_length_mm.push(datapoint[cl]);
  numerics.culmen_depth_mm.push(datapoint[cd]);
  numerics.flipper_length_mm.push(datapoint[fl]);
  numerics.body_mass_g.push(datapoint[bm]);
  categoricals.species.push(datapoint[sp]);
  categoricals.island.push(datapoint[is]);
  categoricals.sex.push(datapoint[sx]);
});

console.log("numerical dimensions", numerics)
console.log("categorical dimensions", categoricals)

//append a circle for each datapoint
// for cx, cy, fill and r we set dummy values for now 
var selection = d3.select('g#scatter-points').selectAll('circle').data(cleanData)
  .enter().append('circle')
  .attr('cx', 0)
  .attr('cy', 0)
  .attr('r', 3)
  .attr('fill', 'black')

//add labels for x and y axis
var yLabel = d3.select('g#vis-g').append('text').attr('class', 'axis-label').text(' ')
var xLabel = d3.select('g#vis-g').append('text').attr('class', 'axis-label')
.attr('transform', 'translate('+ visWidth +', ' + visHeight + ')')
.text(' ')

//TASK: add options to the select tags:
// for all <select>'s we have to add <options> for each data dimension
// the select for the x-axis, y-axis and size should only have numeric dimensions as options
// the select for the color should only have categorical dimensions as options
// add an event listener to the <select> tag
// call the appropriate change function (xAxisChange(newDim), yAxisChange(newDim), colorChange(newDim) or sizeChange(newDim))
const numdims = [cl, cd, fl, bm];
const catdims = [sp, is, sx];

var selectX = d3.select("#x-axis-select")
                .selectAll("option")
                .data(numdims)
                .enter()
                .append('option')
                  .text(d => d)

var selectY = d3.select("#y-axis-select")
                .selectAll("option")
                .data(numdims)
                .enter()
                .append('option')
                  .text(d => d)

var selectSize = d3.select("#size-select")
                .selectAll("option")
                .data(numdims)
                .enter()
                .append('option')
                  .text(d => d)

var selectColor = d3.select("#color-select")
                    .selectAll("option")
                    .data(catdims)
                    .enter()
                    .append('option')
                      .text(d => d)

d3.selectAll("select")
  .on('change', (event, d) => {
    var selectorID = event.currentTarget.id;
    var selectorValue = event.currentTarget.value;

    update(selectorID, selectorValue);

    switch (selectorID) {
      case "x-axis-select":
        xAxisChange(selectorValue);
        break;
      case "y-axis-select":
        yAxisChange(selectorValue);
        break;
      case "size-select":
        sizeChange(selectorValue);
        break;
      case "color-select":
        colorChange(selectorValue);
        break;
      default:
        break;
    }
  });

// TASK: x axis update:
// Change the x Axis according to the passed dimension
// update the cx value of all circles  
// update the x Axis label 
var xAxisChange = (newDim) => {
  var xScale = d3.scaleLinear()
      .domain(d3.extent(numerics[newDim], d => d))
      .range([margin.left, visWidth]);

  selection
    .attr("cx", d => xScale(d[newDim]));

  d3.select("#x-axis")
    .attr("transform", 
          "translate(" + (-margin.left) + ", " + (visHeight) + ")")
    .call(d3.axisBottom(xScale));

  xLabel
    .text(newDim)
    .style("font-size", "10px")
    .attr("transform", 
          "translate(" + (visWidth - margin.right)+ ", " + visHeight + ")");
}


// TASK: y axis update:
// Change the y Axis according to the passed dimension
// update the cy value of all circles  
// update the y Axis label 
var yAxisChange = (newDim) => {
  var yScale = d3.scaleLinear()
      .domain(d3.extent(numerics[newDim], d => d))
      .range([visHeight, margin.top]);

  selection
    .attr("cy", d => yScale(d[newDim]));
 
  d3.select("#y-axis")
  .call(d3.axisLeft(yScale));

  yLabel
    .text(newDim)
    .style("font-size", "10px")
    .attr("transform", 
          "translate(0, " + margin.top + ")")
}


// TASK: color update:
// Change the color (fill) according to the passed dimension
// update the fill value of all circles  
//
// add a <span> for each categorical value to the legend div 
// (see #color-select-legend in the html file)
// the value text should be colored according to the color scale 
var colorChange = (newDim) => {
  var options = [...new Set(categoricals[newDim])];
  var colors = ["blue", "orange", "green", "yellow", "grey", "darkgreen", "pink", "brown", "slateblue"];

  var colorScale = d3.scaleOrdinal()
    .domain(options)
    .range(colors.slice(0, options.length));

  selection
    .style('fill', d => colorScale(d[newDim]));

  var colorLegends = d3.select("#color-select-legend")
                       .selectAll('span')
                       .data(options);

  colorLegends
    .exit()
    .remove();
  
  colorLegends
    .enter()
    .append('span')
    .merge(colorLegends)
     .text(d => d)
     .style('color', d => colorScale(d));
}

// TASK: size update:
// Change the size according to the passed dimension
//    if the dimension contains numbers, use ScaleLinear
//    if the dimension contains strings, use ScaleOrdinal 
// update the r value of all circles  
var sizeChange = (newDim) => {
  var sizeScale = d3.scaleLinear()
      .domain(d3.extent(numerics[newDim], d => d))
      .range([3, 6]);

  selection
    .attr("r", d => sizeScale(d[newDim]));
}

var update = (selectorNode, dimension) => {
  var selector = d3.select(`#${selectorNode}`)
                   .selectedOptions([dimension]);
}


//initialize the scales
xAxisChange('culmen_length_mm')
yAxisChange('culmen_depth_mm')
colorChange('species')
sizeChange('body_mass_g')