var lineWeight = 20;
var lineWeightWave = 10;
var GREEN = "#7EFF0D";
var YELLOW = "#FCFF05";
var ORANGE = "#FF9A00";
var RED = "#FF310D";
var BLACK = "#000000";
var WHITE = "#FFFFFF";
// var states = L.esri.featureLayer({
//   url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/3",
//   style: function(feature) {
//     return {
//       color: '#000000',
//       "fillOpacity": 1.0,
//       weight: 2
//     };
//   }
// });
// var overlays = {
//   "U.S. States": states
// }
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


var markers = [];
var allPulsesGroup = {};
// Loading a geojson file with Sea Level and tide prediction for Oahu coastline
// encoded in LineString
// The file also contains Points which serve to show the pulsating warning
// signals when the map is zoomed out
var coastalWarningsLayer = new L.GeoJSON.AJAX("PacificTest.geojson", {
  onEachFeature: getData,
  // Styling each GeoJSON LineString feature based on the
  // properties.coast_alert_code attribute
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
  // Styling each GeoJSON Point feature based on the
  // properties.region_alert_code attribute so that we can have pulsating alerts
  // when the map is zoomed out
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
    // create a pulse icon
    var pulse = L.icon.pulse({
      iconSize: [20, 20],
      color: alColor,
      fillColor: alColor,
    });
    // Create a marker at lat,lng that has pulse icon
    var mark = new L.marker(latlng, {
      icon: pulse
    });
    // Added all markers to the markers an array that is added to a Layer to be
    // displayed below
    markers.push(mark);
  },

});

coastalWarningsLayer.on('data:progress', function() {
  console.log("Progress");
});

// When the GeoJSON is loaded create a Layer of of pulses and add it to the map
coastalWarningsLayer.on('data:loaded', function() {
  console.log("Loaded");
  allPulsesGroup = L.layerGroup(markers);
  allPulsesGroup.addTo(map);

  // When a pulsating circle is clicked fly to the location of the circle,
  // remove the pulsating layer and show only LineString features after 3 seconds
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

// loads in a wave geojson file and styles the Leaflet layer based on
// the properties.coast_alert_code attribute
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
        console.log("LAYER", feature.geometry.coordinates);

        return {
          color: "white",
          weight: lineWeightWave,
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false
        };
      case 'orange':
        console.log(feature);
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

// Use a setText plugin on waves layer data to add text symbols to it so that
// it looks different from the SeaLevel/Tide data
wavesLayer.on('data:loaded', function() {
  console.log("WAVES LOADED");

  wavesLayer.getLayers().forEach(function(layer) {
    switch (layer.feature.properties.coast_alert_code) {
      case "red":
        layer.setText('~', {
          repeat: true,
          offset: 9,
          attributes: {
            fill: RED,
            'font-weight': 'bold',
            'font-size': '24',
            'rotate': 0,
          }
        });
        break;
      case "orange":
        layer.setText('~', {
          repeat: true,
          offset: 9,
          attributes: {
            fill: ORANGE,
            'font-weight': 'bold',
            'font-size': '24',
            'rotate': 0,
          }
        });
        break;
      case "green":
        layer.setText('~', {
          repeat: true,
          offset: 9,
          attributes: {
            fill: GREEN,
            'font-weight': 'bold',
            'font-size': '24',
            'rotate': 0,
          }
        });
        break;
      default:

    }

  });
  // wavesLayer.getLayers()[0].setText('~', {
  //   repeat: true,
  //   offset: 9,
  //   attributes: {
  //     fill: RED,
  //     'font-weight': 'bold',
  //     'font-size': '24',
  //     'rotate': 0,
  //   }
  // });

});



// Loading the positron map
// Map and label are separate so that we can put the map labels on top of the
// Sea Level and Waves layers
var cartodbAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

var positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
  attribution: cartodbAttribution
});

var positronLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
  attribution: cartodbAttribution,
  pane: 'labels'
});

var positronGroup = L.layerGroup([positron, positronLabels]);


// Create map and add a default layer to it
var map = new L.Map('mapid', {
  center: new L.LatLng(21.463271, -157.969467),
  zoom: 3,
  layers: [streets_s]
});

// Craating panes and assigning zIndex so that Sea Level layer always shows below
// the waves layer but the labels of the positron maps show all the way on top
map.createPane('sealevel');
map.getPane('sealevel').style.zIndex = 399;
// map.getPane('sealevel').style.pointerEvents = 'none';

map.createPane('labels');
map.getPane('labels').style.zIndex = 700;
// Prevent labels from capturing clicks
map.getPane('labels').style.pointerEvents = 'none';

// Creating a selection of maps
// Only one can be active at a time
var baseMaps = {
  "Light": streets_l,
  "Dark": streets_d,
  "Satellite": streets_s,
  "Positron": positronGroup,

};

// Map overlays (SLA, Waves layer)
// Can have multiple active at a time
var overlayMaps = {
  "Tide+SLA Warning": coastalWarningsLayer,
  "Wave Warning": wavesLayer,
  // "Positron Label": positronLabels
};
//
//
L.control.layers(baseMaps, overlayMaps).addTo(map);

function showCoastWarnings() {
  // wavesLayer.addTo(map);
  coastalWarningsLayer.addTo(map);

}

function updateCoastWarnings(dayIndex) {
  coastalWarningsLayer.eachLayer(function(featureInstancelayer) {

    propertyValue = featureInstancelayer.feature.properties.alert_sealevel[dayIndex];

    featureInstancelayer.setStyle({
      color: propertyValue,
    });
  });
  console.log("UPDATE WARNINGS");
}

// Create an instance of Map Controller which controls the display and removal
// of pulsating warning and coastal data based on the map zoom level
var myMapController = new MapController(map);

// Data plotting with plotly


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
  // get the y array of the data of the two traces we are comparing
  arr0 = traces[0].y.slice();
  arr1 = traces[1].y.slice();
  // get indices that have "_NaN_" values (generated in python script for missing data)
  nans_indices_arr1 = getAllIndexes(arr0, "_NaN_");
  nans_indices_arr2 = getAllIndexes(arr1, "_NaN_");
  // Give a high value to data at NaN indices so that a comparison between the two
  // arrays can be made. Because of the Math.min() the 9999 data will be excluded
  for (i = 0; i < nans_indices_arr1.length; i++) {
    arr0[nans_indices_arr1[i]] = 9999;
  }
  for (i = 0; i < nans_indices_arr2.length; i++) {
    arr1[nans_indices_arr2[i]] = 9999;
  }

  //Find a minimum value between the two arrays
  var minVal = Math.min(Math.min.apply(null, arr0), Math.min.apply(null, arr1));
  // Create an array of copies of minimum values in the length of the shorter of the two arrays
  // Maybe it should be in the length of the longer of the two arrays???
  for (var j = 0; j < (Math.min(arr0.length, arr1.length)); j++) {
    // traces['y'][j] = minVal;
    result.push(minVal)
  }

  // Put the "_NaN_" data back where it originally was because of one of the entries
  // was NaN then total water level and wave levels cannot be calculated
  for (i = 0; i < nans_indices_arr1.length; i++) {
    result[nans_indices_arr1[i]] = "_NaN_";
  }
  for (i = 0; i < nans_indices_arr2.length; i++) {
    result[nans_indices_arr2[i]] = "_NaN_";
  }
  return result;
}


function sumTwoArrays(a1, a2) {
  // get indices that have 9999 and give it a value of 0
  nans_indices_a1 = getAllIndexes(a1, 9999);
  nans_indices_a2 = getAllIndexes(a2, 9999);
  for (i = 0; i < nans_indices_a1.length; i++) {
    a1[i] = 0;
  }
  for (i = 0; i < nans_indices_a2.length; i++) {
    a2[i] = 0;
  }

  return a1.map(function(num, idx) {
    return num + a2[idx];
  });
}

function getAllIndexes(arr, val) {
  var indexes = [],
    i;
  for (i = 0; i < arr.length; i++)
    if (arr[i] === val)
      indexes.push(i);
  return indexes;
}

var closestLayer = null;

function getData(feature, layer) {

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


String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}
