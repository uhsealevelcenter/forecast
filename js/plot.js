function plotData(t, tide, msl_obs, msl_for, wav, name) {
  var trace1 = {
    x: t,
    y: tide,
    mode: "lines",
    name: 'High Tide Prediction',
    type: 'scatter',
    line: {
      color: 'rgb(0, 0, 0)',
      width: 3,
      dash: 'dash'
    },
    // fill: 'tozeroy'
  };

  // This is a trace place holder. Its y array is populated by finding the absolute
  // minimum in the tide (trace1) and msl_obs (trace2). The array length is preserved
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
  var traceMin2 = {
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
    y: msl_obs,
    type: 'scatter',
    name: 'Sea Level Observation',
    mode: "lines",
    line: {
      color: 'rgb(86, 180, 233)'
    },
    fill: 'tonexty',
    // error_y: {
    //   type: 'data',
    //   array: [1, 2, 3, 1, 2, 3, 2, 1, 0.5, 2, 3, 4, 1, 2],
    //   visible: true
    // },
  };

  var msl_for_trace = {
    x: t,
    y: msl_for,
    type: 'scatter',
    name: 'Sea Level Forecast',
    mode: "lines",
    line: {
      color: 'red', //rgb(86, 180, 233)
      dash: 'dashdot'
    },
    fill: 'tonexty',
    // error_y: {
    //   type: 'data',
    //   array: [1, 2, 3, 1, 2, 3, 2, 1, 0.5, 2, 3, 4, 1, 2],
    //   visible: true
    // },
  };

  // // Waves data but with removed top line, only showing what is under the line
  // // plus the error bars
  // var trace3 = {
  //   x: t,
  //   y: sumTwoArrays(wav,msl_obs),
  //   type: 'scatter',
  //   name: 'Waves',
  //   mode: 'none',
  //   line: {
  //     color: 'rgba(0,100,80)'
  //   },
  //   fill: 'tonexty',
  //   error_y: {
  //     type: 'data',
  //     array: [1, 2, 3, 1, 2, 3, 2, 4, 5, 3, 2, 1, 2, 4],
  //     visible: true
  //   },
  // };
  //
  // // Total water level line
  // var trace4 = {
  //   x: t,
  //   y: sumTwoArrays(wav,msl_obs),
  //   mode: "lines",
  //   name: 'Total Water Level',
  //   type: 'scatter',
  //   line: {
  //     color: 'rgb(0, 0, 0)',
  //     width: 4,
  //     dash: 'dashdot'
  //   },
  //   // fill: 'tozeroy'
  // };

  // var mymaxVal = maxWaterLevel(tide,msl_obs);
  // console.log("Max Value", mymaxVal);

// Get both tides and mean sea level values that don't have _NaN_
  var nonan = []
  for( var i = 0; i < msl_obs.length-1; i++){
   if ( msl_obs[i] !== "_NaN_") {
       nonan.push(msl_obs[i]);
   }
}
for( var j = 0; j < tide.length-1; j++){
  if ( tide[j] !== "_NaN_") {
   nonan.push(tide[j]);
   }
}

// Find the max water level and an arbitrary value. This is the height at which
// wave images will be plotted
var maxWaterLevel = Math.max.apply(Math, nonan)+15;

// create an empty array populated with the same height for every point
wave_y = []
for (var i = 0; i<t.length-1; i++){
  wave_y.push(maxWaterLevel);
}

// A dummy tracer that only serves as a hack as the images added in the layout
// do not have an event listener. This tracer is placed in the same location
// as the wave images. In the listener, we can listen for the warninglevel
// and highlight all the coasts that have this type of warning
  var dummy = {
    x: t,
    y: wave_y,
    warninglevel : [0,1,2,0,2,1,0,1,2,0,2,1,1],
    type: 'scatter',
    name: 'WaveWarning',
    mode: "markers",
    line: {
      color: 'rgba(0, 0, 0,0)'
    },
    fill: 'tonexty',
    showlegend: false,
    text: 'Wave Level',
    hoverinfo: 'text',

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
  name: 'sla_thresh', // This string the one in the hover listener below
  marker: {
    symbol: 'triangle-left',
    size: 28,
    color: 'rgba(86, 180, 233, 1.0)'
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

// var tot_thresh = {
// // t.slice(-1)[0] gets the last date/time in the t time_vector
// // replaceAt replace string at the specified indexOf, we are looking for index
// // of the second to last character in the string, which is time and we replace
// // it with 23 hrs so that the arrow marker is pushed to the right a little
// x: [t.slice(-1)[0].replaceAt(t.slice(-1)[0].indexOf(t.slice(-1)[0].slice(-2)), "23:59")],
// y: [18],
// mode: 'markers',
// type: 'scatter',
// showlegend: false,
// name: '', // This must be empty string because of the hover listener below
// marker: {
//   symbol: 'triangle-left',
//   size: 28,
//   color: 'rgba(168,207,159,1.0)'
// },
// text: ['Coastal Flooding Threshold'],
// hoverinfo:"y+text",
// // hoverlabel: {
// //   bgcolor: 'rgba(0, 0, 0, 0.5)',
// //   color: 'rgba(0, 0, 0, 0.5)'
// // }
// };

// // Line data that is going to be displayed when a user hovers over arrows
// var tot_thresh_line = {
//   x: [t[0], tot_thresh.x[0]],
//   y: [tot_thresh.y[0],tot_thresh.y[0]],
//   mode: 'lines',
//   type: 'scatter',
//   hoverinfo: 'skip',
//   showlegend: false,
//   visible: false,
//   line: {
//     color: 'rgb(0, 0, 0)',
//     width: 1,
//     dash: 'dashdot'
//   },
// }

//

// Create an array of dictionaries for each wave warning. Based on the warninglevel
// assign appropriate image to be displayed
wave_array = [];
for (var i=0; i<dummy.x.length-1; i++){
  switch (dummy.warninglevel[i]) {
    case 0:
      source = "https://uhslc.soest.hawaii.edu/komar/web_dev/dashboard/assets/green.png";
      break;
    case 1:
        source = "https://uhslc.soest.hawaii.edu/komar/web_dev/dashboard/assets/yellow.png";
      break;
    case 2:
      source = "https://uhslc.soest.hawaii.edu/komar/web_dev/dashboard/assets/red.png";
      break;
    default:
      source = "https://uhslc.soest.hawaii.edu/komar/web_dev/dashboard/assets/green.png";
  }
  wave_array.push(
    {
      "source": source,
      "xref": "x",
      "yref": "y",
      "x": dummy.x[i].split(" ")[0]+" 12:00", // taking only date and adding noon to center wave icons in the middle of the day,
      "y": maxWaterLevel,
      "sizex": 1*24*60*60*1000,
      "sizey": 6,
      "xanchor": "center",
      "yanchor": "middle"
  }
  );
}




  var layout = {
    title: name,
    xaxis: {
      title: 'Date/time',
      autotick: false,
      tick0: "2015-2-17",
      // tick0: t[0],
      dtick: 86400000.0,
      titlefont: {
        family: 'Helvetica, monospace',
        size: 18,
        color: '#000000',

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
    grid: {
      columns: 20,
    },
    margin: {
    l: 50,
    r: 5, //105
    b: 100,
    t: 100,
    pad: 4
  },
  images: wave_array,

  shapes: [
        // 1st highlight during Feb 4 - Feb 6
        {
            type: 'rect',
            // x-reference is assigned to the x-values
            xref: 'x',
            // y-reference is assigned to the plot paper [0,1]
            yref: 'paper',
            x0: t[0].split(" ")[0], // taking only date without time to center the shaded area on the hour
            y0: 0,
            x1: t[0].split(" ")[0],
            y1: 1,
            fillcolor: '#A9A9A9',
            opacity: 0.2,
            line: {
                width: 0
            }
        },
      ]


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

  // // update only values within nested objects
  // var update = {
  //     // title: 'some new title', // updates the title
  //     // 'xaxis.range': [0, 5],   // updates the xaxis range
  //     // 'yaxis.range[1]': 15     // updates the end of the yaxis range
  //     shapes:[
  //       {fillcolor: 'red'}
  //     ]
  // };

  // Creating a minimum horizontal line to fill the graph to
  traceMin.y = minWaterLevel([trace1, trace2]);
  traceMin2.y = minWaterLevel([trace1, msl_for_trace]);
// traceMin.y=[-15.8548230508374, -15.8548230508374, -15.8548230508374, -15.8548230508374, -15.8548230508374, -15.8548230508374,-15.8548230508374];
//   console.log("traceMin", traceMin.y);
  // var data = [traceMin, trace2, trace3, trace1, trace4, sla_thresh,tot_thresh, sla_thresh_line, tot_thresh_line];
  var data = [traceMin, trace2, traceMin2, msl_for_trace, trace1, sla_thresh, dummy, sla_thresh_line];
  Plotly.newPlot('myDiv', data, layout);
  var myPlot = document.getElementById('myDiv');

  myPlot.on('plotly_hover', function(data){
    data.points.map(function(d){

      if(d.data.name==="WaveWarning"){
        //restyling plot, that is, showing the horizontal line tresholds
        // console.log("The entire thing", d);
        // console.log (d.data.name+': x= '+d.x+', y= '+d.y.toPrecision(3));
        // console.log("Beginning", d.data.x[d.pointIndex].split(" ")[0]);
        // console.log("index",d.data.x[d.pointIndex+1]);
        // console.log("End", d.data.x[d.pointIndex+1].split(" ")[0]);
        myPlot.layout.shapes[0].fillcolor= 'red';
        // myPlot.layout.shapes[0].x0= d.data.x[d.pointIndex].split(" ")[0];
        // myPlot.layout.shapes[0].x1= d.data.x[d.pointIndex+1].split(" ")[0];
        // myPlot.layout.shapes[0].x1= 'red';
        var update_lay ={
          shapes:[
            {
                type: 'rect',
                // x-reference is assigned to the x-values
                xref: 'x',
                // y-reference is assigned to the plot paper [0,1]
                yref: 'paper',
                x0: d.data.x[d.pointIndex].split(" ")[0], // taking only date without time to center the shaded area on the hour
                y0: 0,
                x1: d.data.x[d.pointIndex+1].split(" ")[0],
                y1: 1,
                fillcolor: '#A9A9A9',
                opacity: 0.2,
                line: {
                    width: 0
                }

          }
        ]
        };
        Plotly.relayout(myPlot, update_lay);
        updateCoastWarnings(d.pointIndex);
      // Plotly.relayout(myPlot, update);

      }
      if(d.data.name==="sla_thresh"){
        //restyling plot, that is, showing the horizontal line tresholds
        Plotly.restyle(myPlot, {
          visible: true
      }, [6]);

      // Plotly.relayout(myPlot, update);

      }
    });

    // data.points.forEach(function(p) {
    //   console.log("HOVERED ON", p.x);
    //   // Isolating only arrow based on hover name, which is an empty string
    //   myPlot.layout.shapes[0].fillcolor= 'red';
    //   if(p.data.name==="sla_thresh"){
    //     //restyling plot, that is, showing the horizontal line tresholds
    //     Plotly.restyle(myPlot, {
    //       visible: true
    //   }, [5]);
    //
    //   // Plotly.relayout(myPlot, update);
    //
    //   }
    //
	  // });


   //  var infotext = data.points.map(function(d){
   //   console.log (d.data.name+': x= '+d.x+', y= '+d.y.toPrecision(3));
   // });
})
 myPlot.on('plotly_unhover', function(data){
   data.points.map(function(d){
     console.log (d.data.name+': x= '+d.x+', y= '+d.y.toPrecision(3));

     myPlot.layout.shapes[0].fillcolor= '#A9A9A9';
     if(d.data.name==="sla_thresh"){
       //restyling plot, that is, showing the horizontal line tresholds
       Plotly.restyle(myPlot, {
         visible: false
     }, [6]);

     // Plotly.relayout(myPlot, update);

     }
   });
   // data.points.forEach(function(p) {
   //   // Isolating only arrow based on hover name, which is an empty string
   //   myPlot.layout.shapes[0].fillcolor= '#A9A9A9';
   //   if(p.data.name===""){
   //     //restyling plot, that is, removing the horizontal line tresholds
   //     Plotly.restyle(myPlot, {
   //       visible: false
   //   }, [5]);
   //
   //
   //   }
   //
   // });
});
  // To make Graph responsive:
//   window.onresize = function() {
//   Plotly.relayout('myDiv', {
//     width: 0.9 * window.innerWidth,
//     height: 0.9 * window.innerHeight
//   })
// }
}
