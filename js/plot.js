function plotData(t, tide, msl, wav, name) {
  var trace1 = {
    x: t,
    y: tide,
    mode: "lines",
    name: 'High Tide Prediction',
    type: 'scatter',
    line: {
      color: 'rgb(86, 180, 233)',
      width: 3,
      dash: 'dash'
    },
    // fill: 'tozeroy'
  };

  // This is a trace place holder. Its y array is populated by finding the absolute
  // minimum in the tide (trace1) and msl (trace2). The array length is preserved
  var traceMin = {
    x: t,
    y: [],
    mode: "lines",
    name: 'Test',
    type: 'scatter',
    line: {
      color: 'rgba(0,0,0,0)'
    },
    // fill: 'tozeroy'
    hoverinfo: 'skip',
    showlegend: false
  };
  var trace2 = {
    x: t,
    y: msl,
    type: 'scatter',
    name: 'Sea Level',
    mode: "lines",
    line: {
      color: 'rgb(213, 94, 0)'
    },
    fill: 'tonexty',
    error_y: {
      type: 'data',
      array: [1, 2, 3, 1, 2, 3, 2, 1, 0.5, 2, 3, 4, 1, 2],
      visible: true
    },
  };

  // Waves data but with removed top line, only showing what is under the line
  // plus the error bars
  var trace3 = {
    x: t,
    y: sumTwoArrays(wav,msl),
    type: 'scatter',
    name: 'Waves',
    mode: 'none',
    line: {
      color: 'rgba(0,100,80)'
    },
    fill: 'tonexty',
    error_y: {
      type: 'data',
      array: [1, 2, 3, 1, 2, 3, 2, 4, 5, 3, 2, 1, 2, 4],
      visible: true
    },
  };

  // Total water level line
  var trace4 = {
    x: t,
    y: sumTwoArrays(wav,msl),
    mode: "lines",
    name: 'Total Water Level',
    type: 'scatter',
    line: {
      color: 'rgb(0, 0, 0)',
      width: 4,
      dash: 'dashdot'
    },
    // fill: 'tozeroy'
  };

  var sla_thresh = {
  // t.slice(-1)[0] gets the last date/time in the t time_vector
  // replaceAt replace string at the specified indexOf, we are looking for index
  // of the second to last character in the string, which is time and we replace
  // it with 23 hrs so that the arrow marker is pushed to the right a little
  x: [t.slice(-1)[0].replaceAt(t.slice(-1)[0].indexOf(t.slice(-1)[0].slice(-2)), "23:59")],
  y: [10],
  mode: 'markers',
  type: 'scatter',
  showlegend: false,
  name: '', // This must be empty string because of the hover listener below
  marker: {
    symbol: 'triangle-left',
    size: 28,
    color: 'rgba(227, 178, 147, 1.0)'
  },
  text: ['Tidal Flooding Threshold'],
  hoverinfo:"y+text"
};

// Line data that is going to be displayed when a user hovers over arrows
var sla_thresh_line = {
  x: [t[0], sla_thresh.x[0]],
  y: [sla_thresh.y[0],sla_thresh.y[0]],
  mode: 'lines',
  type: 'scatter',
  hoverinfo: 'skip',
  showlegend: false,
  visible: false,
  line: {
    color: 'rgb(0, 0, 0)',
    width: 1,
    dash: 'dashdot'
  },

}

var tot_thresh = {
// t.slice(-1)[0] gets the last date/time in the t time_vector
// replaceAt replace string at the specified indexOf, we are looking for index
// of the second to last character in the string, which is time and we replace
// it with 23 hrs so that the arrow marker is pushed to the right a little
x: [t.slice(-1)[0].replaceAt(t.slice(-1)[0].indexOf(t.slice(-1)[0].slice(-2)), "23:59")],
y: [18],
mode: 'markers',
type: 'scatter',
showlegend: false,
name: '', // This must be empty string because of the hover listener below
marker: {
  symbol: 'triangle-left',
  size: 28,
  color: 'rgba(168,207,159,1.0)'
},
text: ['Coastal Flooding Threshold'],
hoverinfo:"y+text",
// hoverlabel: {
//   bgcolor: 'rgba(0, 0, 0, 0.5)',
//   color: 'rgba(0, 0, 0, 0.5)'
// }
};

// Line data that is going to be displayed when a user hovers over arrows
var tot_thresh_line = {
  x: [t[0], tot_thresh.x[0]],
  y: [tot_thresh.y[0],tot_thresh.y[0]],
  mode: 'lines',
  type: 'scatter',
  hoverinfo: 'skip',
  showlegend: false,
  visible: false,
  line: {
    color: 'rgb(0, 0, 0)',
    width: 1,
    dash: 'dashdot'
  },
}

  var layout = {
    title: name,
    xaxis: {
      title: 'Date/time',
      titlefont: {
        family: 'Helvetica, monospace',
        size: 18,
        color: '#000000'
      }
    },
    yaxis: {
      title: 'cm above MHHW',
      titlefont: {
        family: 'Helvetica, monospace',
        size: 18,
        color: '#000000'
      }
    },
    showlegend: true,
    legend: {
      xanchor: "center",
      yanchor: "top",
      "orientation": "h",
      x: 0.5,
      y: 1.1,
    },
    margin: {
    l: 50,
    r: 5, //105
    b: 100,
    t: 100,
    pad: 4
  },

  // annotations: [
  //   {
  //     x: 1,
  //     y: 10,
  //     xref: 'paper',
  //     yref: 'y',
  //     // text: 'Tidal Flooding*',
  //     showarrow: true,
  //     arrowhead: 2,
  //     ax: 20,
  //     ay: -0,
  //     arrowsize: 3,
  //     arrowwidth: 2,
  //     // arrowcolor: 'rgba(213, 94, 0, 0.6)',
  //     arrowcolor: 'rgba(227, 178, 147, 1.0)',
  //     bordercolor: 'rgba(199, 101, 39, 0.0)',
  //     // borderwidth: 2,
  //     // borderpad: 4,
  //     bgcolor: 'rgba(213, 94, 0, 0.0)',
  //     opacity: 1.0
  //   },
  //   {
  //     x: 1,
  //     y: 18,
  //     xref: 'paper',
  //     yref: 'y',
  //     // text: 'Coastal Flooding*',
  //     showarrow: true,
  //     arrowhead: 2,
  //     ax: 20,
  //     ay: -0,
  //     arrowsize: 3,
  //     arrowwidth: 2,
  //     arrowcolor: 'rgba(159,196,150,0.6)',
  //     arrowcolor: 'rgba(168,207,159,1.0)',
  //     bordercolor: 'rgba(0, 0, 0, 0.0)',
  //     // borderwidth: 3,
  //     // borderpad: 4,
  //     bgcolor: 'rgba(159,196,150,0.0)',
  //     opacity: 1.0
  //   }
  // ]
  // ,
  // shapes: [
  //
  //   //line horizontal
  //
  //   {
  //     type: 'line',
  //     xref: 'paper',
  //     yref: 'y',
  //     x0: 0,
  //     y0: 18,
  //     x1: 1,
  //     y1: 18,
  //     line: {
  //       color: 'rgb(0, 0, 0)',
  //       width: 1
  //     }
  //   },
  //   {
  //     type: 'line',
  //     xref: 'paper',
  //     yref: 'y',
  //     x0: 0,
  //     y0: 10,
  //     x1: 1,
  //     y1: 10,
  //     line: {
  //       color: 'rgb(0, 0, 0)',
  //       width: 1
  //     }
  //   }
  //   ]
  };


  // Creating a minimum horizontal line to fill the graph to
  traceMin.y = minWaterLevel([trace1, trace2]);
  var data = [traceMin, trace2, trace3, trace1, trace4, sla_thresh,tot_thresh, sla_thresh_line, tot_thresh_line];
  Plotly.newPlot('myDiv', data, layout);
  var myPlot = document.getElementById('myDiv');

  myPlot.on('plotly_hover', function(data){
    data.points.forEach(function(p) {
      // Isolating only arrow based on hover name, which is an empty string
      if(p.data.name===""){
        //restyling plot, that is, showing the horizontal line tresholds
        Plotly.restyle(myPlot, {
          visible: true
      }, [7,8]);
      }

	  });


   //  var infotext = data.points.map(function(d){
   //   console.log (d.data.name+': x= '+d.x+', y= '+d.y.toPrecision(3));
   // });
})
 .on('plotly_unhover', function(data){
   data.points.forEach(function(p) {
     // Isolating only arrow based on hover name, which is an empty string
     if(p.data.name===""){
       //restyling plot, that is, removing the horizontal line tresholds
       Plotly.restyle(myPlot, {
         visible: false
     }, [7,8]);
     }

   });
});
  // To make Graph responsive:
//   window.onresize = function() {
//   Plotly.relayout('myDiv', {
//     width: 0.9 * window.innerWidth,
//     height: 0.9 * window.innerHeight
//   })
// }
}
