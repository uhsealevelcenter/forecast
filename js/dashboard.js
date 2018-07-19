var lineWeight = 20;
var lineWeightWave = 10;
var GREEN = "#7EFF0D";
var YELLOW = "#FCFF05";
var ORANGE = "#FF9A00";
var RED = "#FF310D";
var BLACK = "#000000";
var WHITE = "#FFFFFF";
var states = L.esri.featureLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/3",
  style: function(feature) {
    return {
      color: '#000000',
      "fillOpacity": 1.0,
      weight: 2
    };
  }
});
var overlays = {
  "U.S. States": states
}
var streets_l = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
  maxZoom: 12,
  minZoom: 2,
  // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
  // 	'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
  // 	'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox.light'
});

var streets_d = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
  maxZoom: 12,
  minZoom: 2,
  // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
  // 	'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
  // 	'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox.dark'
});

var streets_s = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
  maxZoom: 12,
  minZoom: 2,
  // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
  // 	'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
  // 	'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox.satellite'
});

// Layers in this pane are non-interactive and do not obscure mouse/touch events

// var circle = L.circle([21.467351, -157.976473], {
//   color: 'red',
//   fillColor: '#f03',
//   fillOpacity: 0.5,
//   radius: 500000
// });
//
// circle.bindPopup("Additional Info would go here");
// circle.on("click",function(e){
//   console.log("Clik "+e.latlng);
//   map.flyTo([circle._latlng.lat, circle._latlng.lng], 10);
//   map.removeLayer(circle);
//     plotData();
// });

// map.flyTo([13.87992, 45.9791], 12);
// 	map.on('click', function(e) {
//     // alert(e.latlng);
// 		map.flyTo([e.latlng.lat, e.latlng.lng], 7);
// } );
var markers = [];
var allPulsesGroup = {};
var coastalWarningsLayer = new L.GeoJSON.AJAX("PacificTest.geojson", {
  onEachFeature: getData,
  style: function(feature) {
    switch (feature.properties.coast_alert_code) {
      case 'green':
        return {
          color: GREEN,
          weight: lineWeight,
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round',
          pane: 'sealevel'
        };
      case 'red':
        return {
          color: RED,
          weight: lineWeight,
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round',
          pane: 'sealevel'
        };
      case 'orange':
        return {
          color: ORANGE,
          weight: lineWeight,
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round',
          pane: 'sealevel'
        };
      case 'yellow':
        return {
          color: YELLOW,
          weight: lineWeight,
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round',
          pane: 'sealevel'
        };
    }
  },
  pointToLayer: function(feature, latlng) {
    var alColor = {};
    switch (feature.properties.region_alert_code) {
      case 'green':
        alColor = GREEN;
        break;
      case 'red':
        alColor = RED;
        break;
      case 'orange':
        alColor = ORANGE;
        break;
      case 'yellow':
        alColor = YELLOW;
        break;
    }
    var pulse = L.icon.pulse({
      iconSize: [20, 20],
      color: alColor,
      fillColor: alColor,
    });
    var mark = new L.marker(latlng, {
      icon: pulse
    });
    markers.push(mark);
    // return mark;
  },

});
// var offset=30;
// setInterval(function(){
//   console.log("TIMED");
//   offset-=1;
//   if(offset==0)
//     offset=30;
//   wavesLayer.getLayers()[0].setOffset(offset)
// }, 100);
coastalWarningsLayer.on('data:progress', function() {
  console.log("Progress");
});
coastalWarningsLayer.on('data:loaded', function() {
  console.log("Loaded");
  allPulsesGroup = L.layerGroup(markers);
  allPulsesGroup.addTo(map);

  allPulsesGroup.eachLayer(function(layer) {
    layer.on('click', function() {
      console.log("Clik " + this._latlng);
      map.flyTo([this._latlng.lat, this._latlng.lng], 10);
      map.removeLayer(allPulsesGroup);
      // plotData();
      setTimeout(showCoastWarnings, 3000);
    });
  });
});


coastalWarningsLayer.on('data:loading', function() {
  console.log("Loading");
});

var wavesLayer = new L.GeoJSON.AJAX("waves.geojson", {
  style: function(feature) {
    switch (feature.properties.coast_alert_code) {
      case 'green':
        return {
          color: "white",
          weight: lineWeightWave,
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false
        };
      case 'red':
        return {
          color: "white",
          weight: lineWeightWave,
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false
        };
      case 'orange':
        return {
          color: "white",
          weight: lineWeightWave,
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false
        };
      case 'yellow':
        return {
          color: "white",
          weight: lineWeightWave,
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false
        };
      case 'black':
        return {
          color: "white",
          weight: lineWeightWave,
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false
        };
    }
  }
});
var path = null;
wavesLayer.on('data:loaded', function() {
  console.log("WAVES LOADED");
  // for (var i = 0; i < wavesLayer.getLayers().length; i++){
  //   // l.setOffset(+20)
  //  var test= wavesLayer.getLayers()[i].setOffset(+20).toGeoJSON()
  //  path = L.polyline.antPath(turf.flip(test).geometry.coordinates,
  //   {"delay":400,"dashArray":[10,20],"weight":10,"color":"#FFFFFF40","pulseColor":"#FFFFFFBF","paused":false,"reverse":false,"offset":20}
  //  );
  //  mypath = L.polyline(turf.flip(test).geometry.coordinates);
  //
  //  coastalWarningsLayer.addLayer(wavesLayer.setText('^', {repeat: true,
  //                      offset: 7,
  //                      attributes: {fill: '#007DEF',
  //                                   'font-weight': 'bold',
  //                                   'font-size': '24'}}));
  // coastalWarningsLayer.addLayer(mypath);

  // // Define corridor options including width
  // var options = {
  //   corridor: 1000, // meters
  //   className: 'route-corridor'
  // };
  // var corridor = L.corridor(turf.flip(test).geometry.coordinates, options);
  // map.fitBounds(corridor.getBounds());
  // map.addLayer(corridor);
  // }
  // 🗤
  wavesLayer.setText('~', {
    repeat: true,
    offset: 9,
    attributes: {
      fill: RED,
      'font-weight': 'bold',
      'font-size': '24',
      'rotate': 0,
    }
  });
  // coastalWarningsLayer.addLayer(wavesLayer.setText('^', {repeat: true,
  //                     offset: 12,
  //                     attributes: {fill: '#000000',
  //                                  'font-weight': 'bold',
  //                                  'font-size': '24',
  //                                'rotate':0}}));

});


// wavesLayer.bindPopup("Wave Popup");
// var regionalWarningsLayer = new L.GeoJSON.AJAX("RegionTest.geojson", {
//   onEachFeature: getLocations,
// 	style: function(feature) {
//       switch (feature.properties.region_alert_code) {
//           case 'green': return {color: "#7EFF0D",weight:lineWeight};
//           case 'red':   return {color: "#FF310D",weight:lineWeight};
// 					case 'orange': return {color: "#FF9A00",weight:lineWeight};
//           case 'yellow':   return {color: "#FCFF05",weight:lineWeight};
//       }
//   },
// });

var map = new L.Map('mapid', {
  center: new L.LatLng(21.463271, -157.969467),
  zoom: 2,
  layers: [streets_l]
});
map.createPane('sealevel');
map.getPane('sealevel').style.zIndex = 399;
// map.getPane('sealevel').style.pointerEvents = 'none';

map.createPane('labels');
map.getPane('labels').style.zIndex = 700;

map.getPane('labels').style.pointerEvents = 'none';


var cartodbAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

var positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
  attribution: cartodbAttribution
});

var positronLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
		attribution: cartodbAttribution,
		pane: 'labels'
	});

var positronGroup = L.layerGroup([positron, positronLabels]);

var myIcon = L.divIcon({
  className: 'my-div-icon',
  iconSize: [50, 50],
});
var firefoxIcon = L.icon({
  iconUrl: 'http://joshuafrazier.info/images/firefox.svg',
  iconSize: [100, 100],
});



// var regions = [
//   [21.467351, -157.976473],
//   [7.10743, -188.806218]];
// // you can set .my-div-icon styles in CSS
// // var pulseMarker=L.marker([21.467351, -157.976473], {icon: pulse}).addTo(map);
// var markers = [];
// for (var i = 0; i < regions.length; i++) {
// 			markers.push(new L.marker([regions[i][0],regions[i][1]], {icon: pulse}))
// 				// .addTo(map);
//
//         // markers[i].on("click",function(e){
//         //   console.log("Clik "+e.latlng);
//         //   map.flyTo([marker[i]._latlng.lat, marker[i]._latlng.lng], 10);
//         //   map.removeLayer(marker);
//         //     plotData();
//         //     setTimeout(showCoastWarnings,3000);
//         // });
// 		}

// var allPulsesGroup = L.layerGroup(markers);
// allPulsesGroup.addTo(map);
//
// allPulsesGroup.eachLayer(function(layer){
//   layer.on('click', function(){
//     console.log("Clik "+this._latlng);
//     map.flyTo([this._latlng.lat, this._latlng.lng], 10);
//     map.removeLayer(allPulsesGroup);
//       plotData();
//       setTimeout(showCoastWarnings,3000);
//   });
// });

// pulseMarker.on("click",funct;ion(e){
//   console.log("Clik "+e.latlng);
//   map.flyTo([pulseMarker._latlng.lat, pulseMarker._latlng.lng], 10);
//   map.removeLayer(pulseMarker);
//     plotData();
//     setTimeout(showCoastWarnings,3000);
// });



// var myBase = L.layerGroup([streets]);
// var sla = L.layerGroup([states]);

var baseMaps = {
  "Light": streets_l,
  "Dark": streets_d,
  "Satellite": streets_s,
  "Positron": positronGroup,

};
var overlayMaps = {
  "Tide+SLA Warning": coastalWarningsLayer,
  "Wave Warning": wavesLayer,
  // "Positron Label": positronLabels
};
//
//
L.control.layers(baseMaps, overlayMaps).addTo(map);

// map.on("zoomend",function(){
//     zoomLev = map.getZoom();
//     if(zoomLev<5){
//       console.log("Zoom Level: "+zoomLev+" ,Adding Layer");
//       map.addLayer(pulseMarker);
//       map.removeLayer(coastalWarningsLayer);
//     }else{
//       map.addLayer(coastalWarningsLayer);
//       map.removeLayer(pulseMarker);
//     }
// });

// coastalWarningsLayer.addTo(map);
// circle.addTo(map);


// var pointGrid = $.getJSON("GeoObs.json", function(json) {
// 	return json.features[1]; // this will show the info it in firebug console
// });
// console.log(pointGrid);
function showCoastWarnings() {
  // wavesLayer.addTo(map);
  coastalWarningsLayer.addTo(map);

}

var myMapController = new MapController(map);

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
    r: 50, //105
    b: 100,
    t: 100,
    pad: 4
  },

  annotations: [
    {
      x: 1,
      y: 10,
      xref: 'paper',
      yref: 'y',
      // text: 'Tidal Flooding*',
      showarrow: true,
      arrowhead: 2,
      ax: 20,
      ay: -0,
      arrowsize: 3,
      arrowwidth: 2,
      // arrowcolor: 'rgba(213, 94, 0, 0.6)',
      arrowcolor: 'rgba(227, 178, 147, 1.0)',
      bordercolor: 'rgba(199, 101, 39, 0.0)',
      // borderwidth: 2,
      // borderpad: 4,
      bgcolor: 'rgba(213, 94, 0, 0.0)',
      opacity: 1.0
    },
    {
      x: 1,
      y: 18,
      xref: 'paper',
      yref: 'y',
      // text: 'Coastal Flooding*',
      showarrow: true,
      arrowhead: 2,
      ax: 20,
      ay: -0,
      arrowsize: 3,
      arrowwidth: 2,
      arrowcolor: 'rgba(159,196,150,0.6)',
      arrowcolor: 'rgba(168,207,159,1.0)',
      bordercolor: 'rgba(0, 0, 0, 0.0)',
      // borderwidth: 3,
      // borderpad: 4,
      bgcolor: 'rgba(159,196,150,0.0)',
      opacity: 1.0
    }
  ]
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
  var data = [traceMin, trace2, trace3, trace1, trace4];
  Plotly.newPlot('myDiv', data, layout);
  
  // To make Graph responsive:
//   window.onresize = function() {
//   Plotly.relayout('myDiv', {
//     width: 0.9 * window.innerWidth,
//     height: 0.9 * window.innerHeight
//   })
// }
}

function stackedArea(traces) {
  for (var i = 1; i < traces.length; i++) {
    for (var j = 0; j < (Math.min(traces[i]['y'].length, traces[i - 1]['y'].length)); j++) {
      traces[i]['y'][j] += traces[i - 1]['y'][j];
    }
  }
  return traces;
}

function minWaterLevel(traces) {
  result = [];
  arr0 = traces[0].y.slice();
  arr1 = traces[1].y.slice();
  if (arr0.indexOf("_NaN_") > 0)
    arr0[arr0.indexOf("_NaN_")] = 9999;
  if (arr1.indexOf("_NaN_") > 0)
    arr1[arr1.indexOf("_NaN_")] = 9999;
  var minVal = Math.min(Math.min.apply(null, arr0), Math.min.apply(null, arr1));
  for (var j = 0; j < (Math.min(arr0.length, arr1.length)); j++) {
    // traces['y'][j] = minVal;
    result.push(minVal)
  }

  return result;
}

function sumTwoArrays(a1, a2) {
  return a1.map(function(num, idx) {
    return num + a2[idx];
  });
}

var closestLayer = null;

function getData(feature, layer) {
  // console.log(feature.properties.tide_values);
  // console.log(typeof(feature.properties.tide_values));


  // var el = document.createElement('div');
  // el.classList.add("my-class");
  // el.innerHTML = '<h2>' +"NK"+ feature.id + '</h2>';
  // layer.bindPopup(el);

  var time = feature.properties.time_vector;
  var tide = feature.properties.tide_values;
  var msl = feature.properties.sealevel_values;
  var location = feature.id;
  var sl_alerts = feature.properties.alert_sealevel;
  // var wave = [17,18,19,20,18,17,16,15,16,17,18,15,16,17]

  // layer.bindPopup('<h2>' +location + '</h2> <br>'+feature.properties.alert_sealevel+'<br>'+time);

  // layer.bindPopup('<iframe id="ifr" src="./myPopup.html"></iframe>');
  // $('#ifr').contents().find('body').find('h1').innerText = "NEMA"
  // layer.bindPopup()
  // console.log(time);
  var popup = new L.Popup();

  layer.bindPopup(popup);

  layer.on("click", function(e) {
    // console.log("Clik "+feature.id);
    // console.log(feature.properties.alert_sealevel);
    // console.log($('#ifr').contents().find('body').find('h1').innerText);

    // Finds the wave layer closest to the clicked location and gets the wave data
    closestLayer = L.GeometryUtil.closestLayer(map, wavesLayer.getLayers(), e.latlng)
    var wave = closestLayer.layer.feature.properties.wave_values
    plotData(time, tide, msl, wave, location);
    // $('#ifr').contents().find('h1').html('<div> KJDFHSDFKSHFKJSHJKFSDKJFBFKJDKBJ </div>');
    // popup.setContent('<iframe id="ifr" src="./myPopup.html"></iframe>');
    // var iframe = document.createElement('iframe');
    // iframe.onload = iframeN(); // before setting 'src'
    // iframe.src = './myPopup.html';
    // iframe.id ='ifr';
    // document.body.appendChild(iframe); // add it to wherever you need it in the document

    // document.getElementById('ifr').contentWindow.testingIframe("PASSING");
    // popup.setContent('<iframe id="ifr" src="./myPopup.html"></iframe>');

    // $("#feature-title").html("myMarkerTitle");
    // $("#feature-info").html("myMarkerContent");
    // $("#featureModal").modal("show");
    // layer.bindPopup(popup);
    // console.log("CALLED");
    // $('#ifr').ready(function () {
    // $('#ifr').contents().find('h1').html('KJDFHSDFKSHFKJSHJKFSDKJFBFKJDKBJ');
    // popup.setContent(iframe)


    popup.setContent(assemblePopup(time, location, sl_alerts))

  });

};

function assemblePopup(t, l, alert) {
  console.log(alert);
  return '<h3>' + l + '</h3>';
  // return '<h1>' + l + '</h1> <br> <div class="textCircle">' + t[0] + '</div><div class="textCircle">' + t[1] + '</div>' + '</div><div class="textCircle">' + t[2] + '</div>' + '</div><div class="textCircle">' + t[3] + '</div>' + '</div><div class="textCircle">' + t[4] + '</div>' + '</div><div class="textCircle">' + t[5] + '</div>' + '</div><div class="textCircle">' + t[6] + '</div>'
}

function rgbColorString(x, colormap) {
  var color = interpolateLinearly(x, colormap)
  r = Math.round(255 * color[0]);
  g = Math.round(255 * color[1]);
  b = Math.round(255 * color[2]);
  return 'rgb(' + r + ', ' + g + ', ' + b + ')'
}

function normalize(min, max, data) {
  norm = [];
  dataMin = Math.min(...data);
  dataMax = Math.max(...data);
  for (i = 0; i < data.length; i++) {
    norm.push((max - min) * (data[i] - dataMin) / (dataMax - dataMin) + min)
  }
  return norm;
}

function enforceBounds(x) {
  if (x < 0) {
    return 0;
  } else if (x > 1) {
    return 1;
  } else {
    return x;
  }
}

function interpolateLinearly(x, values) {

  // Split values into four lists
  var x_values = [];
  var r_values = [];
  var g_values = [];
  var b_values = [];
  for (i in values) {
    x_values.push(values[i][0]);
    r_values.push(values[i][1][0]);
    g_values.push(values[i][1][1]);
    b_values.push(values[i][1][2]);
  }

  var i = 1;
  while (x_values[i] < x) {
    i = i + 1;
  }
  i = i - 1;

  var width = Math.abs(x_values[i] - x_values[i + 1]);
  var scaling_factor = (x - x_values[i]) / width;

  // Get the new color values though interpolation
  var r = r_values[i] + scaling_factor * (r_values[i + 1] - r_values[i])
  var g = g_values[i] + scaling_factor * (g_values[i + 1] - g_values[i])
  var b = b_values[i] + scaling_factor * (b_values[i + 1] - b_values[i])

  return [enforceBounds(r), enforceBounds(g), enforceBounds(b)];


}
