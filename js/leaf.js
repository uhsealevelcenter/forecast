// var map = L.map('map').setView([51.505, -0.09], 13);
//
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);
//
// L.marker([51.5, -0.09]).addTo(map)
//     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
//     .openPopup();
// [39.74739, -105], 13
// [21.4389, -158.0001], 9
// var mymap = L.map('mapid').setView([21.284500, -157.843766], 6);
var lineWeight = 20;
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
var baseLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
  maxZoom: 13,
  // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
  // 	'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
  // 	'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox.streets'
});

var circle = L.circle([21.284500, -157.843766], {
  color: 'red',
  fillColor: '#f03',
  fillOpacity: 0.5,
  radius: 5000
});

circle.bindPopup("Additional Info would go here");

// defining spacing interval to be plotted
var breaks = [];
for (i = -30; i < 30; i++) {
  breaks.push(i);
}
// Normalize sea level anomaly data between 0 and 1 for easier plotting
var breaksNorm = normalize(0, 1, breaks);

// Assign color to each contour on the plot based on the normalized value of
// sea level anomaly
var mybreakProperties = [{}]
for (i = 0; i < breaksNorm.length; i++) {
  mybreakProperties[i] = {
    "fillOpacity": 1.0,
    "color": rgbColorString(breaksNorm[i], jet),
    "fillColor": rgbColorString(breaksNorm[i], jet)
  }
}

// Here we can specify properties that apply to all of the contours at once
var cmn = {
  "color": "black",
  "fillColor": "black"
}
var cmn = {}

// Retrieving PointGrid json file that I produced from the csv file of data
//"GeoObs.json"
$.getJSON("GeoObs.json", function(data) {

  //calculating isolines for the contour plot. The turf.isobands returns grouped
  // MultiPolygons sorted based on breaks variable
  var isolines = turf.isobands(data, breaks, {
    zProperty: 'sla',
    commonProperties: cmn,
    breaksProperties: mybreakProperties
  });

  // console.log(isolines)
  // console.log(data)

  // Applying styling
  var seaLevelLayer = L.geoJSON([isolines], {

    style: function(feature) {
      // console.log("Style: " + feature.properties.color)
      return feature.properties;
    },

    onEachFeature: onEachFeature,
  });

	// map.flyTo([13.87992, 45.9791], 12);
// 	map.on('click', function(e) {
//     // alert(e.latlng);
// 		map.flyTo([e.latlng.lat, e.latlng.lng], 7);
// } );
  var geojsonLayer = new L.GeoJSON.AJAX("OahuTest.geojson", {
    onEachFeature: popUp,
    onEachFeature: getData,
		style: function(feature) {
        switch (feature.properties.alert_code) {
            case 'green': return {color: "#7EFF0D",weight:lineWeight};
            case 'red':   return {color: "#FF310D",weight:lineWeight};
						case 'orange': return {color: "#FF9A00",weight:lineWeight};
            case 'yellow':   return {color: "#FCFF05",weight:lineWeight};
        }
    },

  });

  geojsonLayer.on('data:progress', function(){
    console.log("Progress");
  });
  geojsonLayer.on('data:loaded', function(){
    console.log("Loaded");
    plotData();
  });
  geojsonLayer.on('data:loading', function(){
    console.log("Loading");
  });

  var map = new L.Map('mapid', {
  	center: new L.LatLng(21.284500, -157.843766),
  	zoom: 5,
  	layers: [baseLayer,geojsonLayer] // there is also seaLevelLayer and states
  });

  function popUp(feature, layer) {
    layer.bindPopup(feature.id);
  }


	var myBase = L.layerGroup([baseLayer,geojsonLayer]);
  var sla = L.layerGroup([states,seaLevelLayer]);

	var baseMaps = {
	    "Map": baseLayer,
      // "Warnings": geojsonLayer
	};
	var overlayMaps = {
	    "SLA": sla
	};
	//
	//
	L.control.layers(baseMaps, overlayMaps).addTo(map);

  map.on("zoomend",function(){
      zoomLev = map.getZoom();
      console.log("Zoom: "+zoomLev);
  });

	// geojsonLayer.addTo(map);

  // Function to download data to a file for testing purposes
  // function download(data, filename, type) {
  // 		var file = new Blob([data], {type: type});
  // 		if (window.navigator.msSaveOrOpenBlob) // IE10+
  // 				window.navigator.msSaveOrOpenBlob(file, filename);
  // 		else { // Others
  // 				var a = document.createElement("a"),
  // 								url = URL.createObjectURL(file);
  // 				a.href = url;
  // 				a.download = filename;
  // 				document.body.appendChild(a);
  // 				a.click();
  // 				setTimeout(function() {
  // 						document.body.removeChild(a);
  // 						window.URL.revokeObjectURL(url);
  // 				}, 0);
  // 		}
  // };
  //
  // download(JSON.stringify(isolines),'NEMANJA.json','text/plain')

});


// var pointGrid = $.getJSON("GeoObs.json", function(json) {
// 	return json.features[1]; // this will show the info it in firebug console
// });
// console.log(pointGrid);
function plotData(){
  console.log(tides);
  var trace1 = {
    x: time[0],
    y: tides[0],
    mode: "lines",
    name: 'Tidal prediction',
    type: 'scatter'
  };
  var trace2 = {
    x: time[0],
    y: msl[0],
    type: 'scatter',
    name: 'Mean Sea Level',
    mode: "lines",
  };
  var data = [trace1, trace2];
  Plotly.newPlot('myDiv', data);


}
function onEachFeature(feature, layer) {
  // var popupContent = "<p>GeoJSON " +
  // 		feature.geometry.type + ", to Leaflet vector</p> "+feature.properties.sla;
  var popupContent = "<p>Sea level anomaly: " + feature.properties.sla + " cm";

  if (feature.properties && feature.properties.popupContent) {
    popupContent += feature.properties.popupContent;
  }
  layer.bindPopup(popupContent);
};
var time = [];
var tides = [];
var msl = [];
function getData(feature, layer) {
  // console.log(feature.properties.tide_values);
  // console.log(typeof(feature.properties.tide_values));
  time.push( feature.properties.time_vector);
  tides.push( feature.properties.tide_values);
  msl.push( feature.properties.sealevel_values);
  // typeof
};


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
