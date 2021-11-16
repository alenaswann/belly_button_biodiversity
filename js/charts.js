function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samples = data.samples;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var searchedSample = samples.filter(sampleObj => sampleObj.id == sample);
    // Create a variable that filters the metadata array for the object with the desired sample number.
    var metadata = data.metadata;
    var searchedMetadata = metadata.filter(sampleObj => sampleObj.id == sample);
    var metadataResult = searchedMetadata[0];
    console.log(metadataResult);
    //  5. Create a variable that holds the first sample in the array.
    var sampleResult = searchedSample[0];
    //console.log(sampleResult);
    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var sampleOtuIDs = sampleResult.otu_ids;
    var sampleOtuLabels = sampleResult.otu_labels;
    var sampleValues = sampleResult.sample_values;
    //console.log(sampleValues);
    //console.log(sampleOtuIDs);
    //Create a variable that holds the washing frequency.
    var wFreq = parseFloat(metadataResult.wfreq);

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
    
    var bacteriaOrder = searchedSample.sort(function(a, b) { 
      return parseFloat(b.sample_values) - (a.sample_values);
    });
    var bacteria = bacteriaOrder[0];
    //console.log(bacteria);
    var yticks = bacteria.otu_ids.slice(0, 10).reverse();
    var OtuLabels_Ten = bacteria.otu_labels.slice(0,10).reverse();
    var sampleValues_Ten =bacteria.sample_values.slice(0,10).reverse();
 
    // 8. Create the trace for the bar chart. 
    var barData = [{
      x: sampleValues_Ten,
      y: yticks.map(tick => "OTU " + tick),
      text: OtuLabels_Ten,
      orientation: 'h',
      type: "bar"
    }];
    // 9. Create the layout for the bar chart. 
    var barLayout = {
     title: "Top 10 Bacteria Cultures Found",
     xaxis: {title: "OTU Values"},
     yaxis: {title: "OTU IDs"}
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);

    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x: sampleOtuIDs,
      y: sampleValues,
      text: sampleOtuLabels,
      mode: 'markers',
      marker: {
        size: sampleValues,
        color: sampleOtuIDs,
        colorscale: "Portland"
      }
  }];
    
    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bacteria Cultures Per Sample",
      xaxis: {title: "OTU ID"},
      hovermode:'closest',
      margin: {
      l: 100,
      r: 100,
      b: 50,
      t: 50,
      pad: 4 } 
    };
    
    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout); 

    //Create the trace for the gauge chart.
    var gaugeData = [{
      domain: {x:[0, 10], y:[0, 10]},
      value: wFreq,
      type: "indicator",
      mode: "gauge+number",
      title: {text: "<b>Belly Button Washing Frequency</b> <br>Scrubs per Week"},
      gauge: {
        axis: { range: [0, 10], tickmode: 'array', tickvals: [0,2,4,6,8,10], tickwidth: 1, tickcolor: "black" },
        bar: {color: "black"},
        steps: [
          { range: [0, 2], color: "green" },
          { range: [2, 4], color: "lightgreen" },
          { range: [4, 6], color: "yellow" },
          { range: [6, 8], color: "orange" },
          { range: [8, 10], color: "red" }
        ]},
        
    }];
    //Create the layout for the gauge chart.
    var gaugeLayout = {
      width: 450,
      height: 350,
      margin: {b:10}
    };
    // Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
  });

  
}

