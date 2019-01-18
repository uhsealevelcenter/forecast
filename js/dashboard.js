var lineWeight = 20;
var lineWeightWave = 10;
var GREEN = "#7EFF0D";
var YELLOW = "#FCFF05";
var ORANGE = "#FF9A00";
var RED = "#FF310D";
var BLACK = "#000000";
var WHITE = "#FFFFFF";

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
var seaLevelLayer = {};
var wavesLayer = {};
var regionAlertLayer = {};
var stationsLayer = {};

// Loading a geojson file with Sea Level and tide prediction for Oahu coastline
// encoded in LineString
// The file also contains Points which serve to show the pulsating warning
// signals when the map is zoomed out
var mainGeoJSON = new L.GeoJSON.AJAX("TestWaveForecast.geojson");

mainGeoJSON.on('data:progress', function() {
  console.log("Progress");
});
var coastalWarningsLayer = {};
var selectedFeature = null;
var myControl = null;
var sidebar = null;
// When the GeoJSON is loaded create a Layer of of pulses and add it to the map
mainGeoJSON.on('data:loaded', function() {
  console.log("Loaded", mainGeoJSON);
  var geoJsonFormat = this.toGeoJSON();

  coastalWarningsLayer = L.geoJSON(geoJsonFormat, {
    filter: function(feature, layer) {
      return typeof feature.properties.sl_component !== "undefined";
    }
  });

  wavesLayer = L.geoJSON(geoJsonFormat, {
    filter: function(feature, layer) {
      return typeof feature.properties.coastline_center !== "undefined";
    }
  });

  stationsLayer = L.geoJSON(geoJsonFormat, {
    filter: function(feature, layer) {
      return typeof feature.properties.some_property !== "undefined";
    }
  });


  regionAlertLayer = L.geoJSON(geoJsonFormat, {

    pointToLayer: function(feature, latlng) {

      if (feature.properties.show_on_map) {
        var alertColor = {};
        switch (feature.properties.region_master_alert_code) {
          case 0:
            alertColor = GREEN;
            break;
          case 2:
            alertColor = RED;
            break;
          case 1:
            alertColor = ORANGE;
            break;
        }
        // create a pulse icon
        var pulse = L.icon.pulse({
          iconSize: [20, 20],
          color: alertColor,
          fillColor: alertColor,
        });
        // Create a marker at lat,lng that has pulse icon
        var mark = new L.marker(latlng, {
          icon: pulse,
          title: feature.id,
          myCustomOption: "Can Insert Data Here",
        });
        // Added all markers to the markers an array that is added to a Layer to be
        // displayed below
        markers.push(mark);
      }
      // return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });

  coastalWarningsLayer.getLayers().forEach(function(layer) {

    switch (Math.max.apply(null, layer.feature.properties.sl_component.sea_level_forecast)) {
      case 0:
        layer.setStyle({
          color: GREEN,
          weight: lineWeight,
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round',
          pane: 'sealevel'
        });
        break;
      case 2:
        layer.setStyle({
          color: RED,
          weight: lineWeight,
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round',
          pane: 'sealevel'
        });
        break;
      case 1:
        layer.setStyle({
          color: ORANGE,
          weight: lineWeight,
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round',
          pane: 'sealevel'
        });
        break;
    }
  });

  wavesLayer.getLayers().forEach(function(layer) {
    // console.log("TST", layer.feature.properties.wave_component_alert_code);
    if (layer.feature.properties.wave_component_alert_code != null) {
      switch (Math.max.apply(null, layer.feature.properties.wave_component_alert_code)) {

        case 2:
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
        case 1:
          console.log("HERE");
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
        case 0:
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

      }
    } else {
      // console.log("VALUE IS NULL");
    }

  });

  wavesLayer.setStyle({
    color: "white",
    weight: lineWeightWave,
    opacity: 1.0,
    lineCap: 'round',
    lineJoin: 'round',
    interactive: false
  });

  // Map overlays (SLA, Waves layer)
  // Can have multiple active at a time
  var overlayMaps = {
    "Tide+SLA Warning": coastalWarningsLayer,
    "Wave Warning": wavesLayer,
    "Tide Gauge Locations": stationsLayer,
  };
  //
  //
  myControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

  sidebar = L.control.sidebar('sidebar', {
    position: 'right'
  });
  map.addControl(sidebar);


  allPulsesGroup = L.layerGroup(markers);
  allPulsesGroup.addTo(map);

  // When a pulsating circle is clicked fly to the location of the circle,
  // remove the pulsating layer and show only LineString features after 3 seconds
  allPulsesGroup.eachLayer(function(layer) {
    layer.on('click', function() {
      // console.log("Clik " + this._latlng);
      map.flyTo([this._latlng.lat, this._latlng.lng], 8);
      map.removeLayer(allPulsesGroup);
      boxFlow1(this.options.title);
      // plotData();
      setTimeout(showCoastWarnings, 1900);
    });
  });


  // Display tide gauge info on hover
  stationsLayer.eachLayer(function(layer) {
    layer.bindPopup("Some tide gauge info: " + layer.feature.id +"<br>" + "Click for more info");
    layer.on('mouseover', function(e) {
      this.openPopup();
    });
    layer.on('mouseout', function(e) {
      this.closePopup();
    });

    layer.on('click', function() {
      sidebar.toggle();
    });

  });

  var popup = new L.Popup();

  coastalWarningsLayer.bindPopup(popup);
  // Layer click handler
  coastalWarningsLayer.on('click', function(e) {
    var time = e.layer.feature.properties.sl_component.time;
    // // var location = feature.id;
    var sl_alerts = e.layer.feature.properties.sl_component.sea_level_forecast;

    // Finds the wave layer closest to the clicked location and gets the wave data
    var closestLayer = L.GeometryUtil.closestLayer(map, wavesLayer.getLayers(), e.latlng)

    $.getJSON('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + e.latlng.lat + '&lon=' + e.latlng.lng, function(data) {
      //data is the JSON string
      // console.log("json respom",data.display_name);

      var location = data.display_name.split(",").slice(0, 3);
      selectedFeature = closestLayer.layer.feature;
      var wave = closestLayer.layer.feature.properties.wave_component_alert_code
      // Remove plotting for now
      // plotData(time, tide, msl_obs, msl_for, wave, extremeHigh, location);
      // console.log("LOCATION: ", location);
      // var newMarker = new L.marker(e.latlng).addTo(map);
      boxFlow2(location, time, sl_alerts, wave);
      updateDetailsBox(0);
      popup.setContent(assemblePopup(time, location, sl_alerts))
    });
  });

});

mainGeoJSON.on('data:loading', function() {
  console.log("Loading");
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
  layers: [streets_s],
  zoomControl: false,
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

function showCoastWarnings() {
  // wavesLayer.addTo(map);
  coastalWarningsLayer.addTo(map);
  stationsLayer.addTo(map);
}

// Create an instance of Map Controller which controls the display and removal
// of pulsating warning and coastal data based on the map zoom level
var myMapController = new MapController(map);

function stackedArea(traces) {
  for (var i = 1; i < traces.length; i++) {
    for (var j = 0; j < (Math.min(traces[i]['y'].length, traces[i - 1]['y'].length)); j++) {
      traces[i]['y'][j] += traces[i - 1]['y'][j];
    }
  }
  return traces;
}

function minWaterLevel(tracer, minLevel) {
  result = [];
  // get the y array of the data of the tracer we are comparing
  arr0 = tracer.y.slice();

  for (var j = 0; j < arr0.length; j++) {
    // traces['y'][j] = minVal;
    if (typeof arr0[j] == 'number')
      result.push(minLevel);
    else {
      result.push("");
    }
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

$(document).ready(function(e) {
  $("#datatable").delegate("td", "click", function(e) {
    // Stop click propagation so that the popup stays on the map when different
    // days are selected
    e.stopPropagation();
    // Move map when big table is open
  //   if($(".item4").is(":hidden")){
  //     map.panBy([-485, 0], {
  //       duration: 0.5
  //     });
  // }
    $(".item4").show();

    // Remove existing arrow befor adding new one
    $("#datatable tr").removeClass("selectedRow")
    $(this).parent().addClass('selectedRow');

    // Fade out unselected rows
    $('#datatable').children('tr').each(function(i, obj) {
      if (obj.classList.contains("selectedRow"))
        $(this).css("opacity", "1.0");
      else
        $(this).css("opacity", "0.3");
    });

    var rowClicked = $(this).parent().index() - 1;
    updateDetailsBox(rowClicked);
  });
});



function updateDetailsBox(row) {
  if (selectedFeature.properties.swell_height !== null) {
    $("#swellH").text(selectedFeature.properties.swell_height[row]);
    $("#swellP").text(selectedFeature.properties.swell_period[row]);
    $("#swellD").text(selectedFeature.properties.swell_direction[row]);
    $("#waveLow").text(selectedFeature.properties.wave_component_water_level[row][0]);
    $("#waveHigh").text(selectedFeature.properties.wave_component_water_level[row][1]);

    switch (selectedFeature.properties.wave_component_alert_code[row]) {
      case 0:
        $("#waveWarning").css("background-color", "grey");
        $("#waveAlert h2").css("color", "grey");
        break;
      case 1:
        $("#waveWarning").css("background-color", ORANGE);
        $("#waveAlert h2").css("color", ORANGE);
        break;
      case 2:
        $("#waveWarning").css("background-color", RED);
        $("#waveAlert h2").css("color", RED);
        break;
      default:

    }

    switch (selectedFeature.properties.sl_component.sea_level_forecast[row]) {
      case 0:
        $("#tideWarning").css("background-color", "grey");
        $("#tideAlert h2").css("color", "grey");
        break;
      case 1:
        $("#tideWarning").css("background-color", ORANGE);
        $("#tideAlert h2").css("color", ORANGE);
        break;
      case 2:
        $("#tideWarning").css("background-color", RED);
        $("#tideAlert h2").css("color", RED);
        break;
      default:

    }


  } else {
    $("#swellH").text("-");
    $("#swellP").text("-");
    $("#swellD").text("-");
    $("#waveLow").text("-");
    $("#waveHigh").text("-");
  }


}

var theParent = document.getElementById("overlayParent");
theParent.addEventListener("click", closeBox, false);

function closeBox(e) {
  var parentContainer = $(e.target.parentNode);
  if (e.target.nodeName === "SPAN") {
    if (parentContainer.hasClass("item1") || parentContainer.hasClass("item2")) {
      if (parentContainer.hasClass("item2")) {
        boxClose2();
      }
    }
      // parentContainer.hide();
      if (parentContainer.hasClass("item2") || parentContainer.hasClass("item3")) {
        boxClose2();
      }
      if (parentContainer.hasClass("item4")) {
        // map.panBy([$(".item4").width(), 0], {
        //   duration: 0.5
        // });
        $(".item4").hide();

      }

  }
}

function boxClose2() {
  if($('.item2').children('p').text() != "Choose from map"){
    if($(".item3").is(":visible")){
      map.panBy([$(".item3").width(), 0], {
        duration: 0.5
      });
    }
    if($(".item3").is(":visible") & $(".item3").is(":visible")){
      map.panBy([$(".item3").width(), 0], {
        duration: 0.5
      });
    }
  }
  $('.item2').children('p').text("Choose from map");
  $(".item3").hide();
  $(".item4").hide();
}

function resetAllBoxes() {
  $('.item1').children('p').text("Choose from map");
  $(".item2").hide();
  $(".item3").hide();
  $(".item4").hide();
}

function boxFlow1(title) {
  $('.item1').children('p').text(title);
  $(".item2").show();
  $(`<style>.item1:after{
    content:"";
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 0;
    border: 18px solid transparent;
    border-top-color: white;
    border-bottom: 0;
    margin-left: -18px;
    margin-bottom: -18px;
  }</style>`).appendTo('head');
}

function boxFlow2(loc, t, sl_al, wave_al) {
  $('.item2').children('p').text(loc);
  // Move move so that the table doesn't obscure the view
  if($('.item3').is(":hidden")){map.panBy([-325, 0], {
    duration: 0.5
  });}
  $(".item3").show();
  $(`<style>.item2:after{
    content: "";
    position: absolute;
    right: 0;
    top: 50%;
    width: 0;
    height: 0;
    border: 18px solid transparent;
    border-left-color: white;
    border-right: 0;
    margin-top: -18px;
    margin-right: -18px;}</style>`).appendTo('head');
  if (wave_al === null) {
    wave_al = ['-', '-', '-', '-', '-', '-', '-'];
  }
  //clear the table
  $('#datatable tr:has(td)').remove();
  for (var i = 0; i < 7; i++) {
    var dateString = t[i].slice(0, -3);
    var d = new Date(dateString);
    var dayName = getDayName(d, "en-US");
    var srcStringT = "";
    var srcStringW = "";
    switch (sl_al[i]) {
      case 0:
        srcStringT = "css/circle.svg";
        break;
      case 1:
        srcStringT = "css/circleO.svg";
        break;
      case 2:
        srcStringT = "css/circleR.svg";
        break;
      default:
        srcStringT = "css/circle.svg";
    }

    switch (wave_al[i]) {
      case 0:
        srcStringW = "css/circle.svg";
        break;
      case 1:
        srcStringW = "css/circleO.svg";
        break;
      case 2:
        srcStringW = "css/circleR.svg";
        break;
      default:
        srcStringW = "css/circle.svg";
    }


    $('#datatable').append(
      $('<tr>').append(
        $('<td>').append(
          $('<img width= 12px; height = 12px;>').attr('src', srcStringT)
          // .addClass('selectRow')
          // .text(i+"N")
        ),
        $('<td>').append(
          $('<img width= 12px; height = 12px;>').attr('src', srcStringW)
          // $('<a>').attr('href', 'https://www.blic.rs')
          // .addClass('imgurl')
          // .attr('target', '_blank')
          // .text(i+"K")
        ),
        $('<td>').append(dayName).addClass('dayColumn'),
        $('<td>').append(dateString)
      )
    );
  }



}

function assemblePopup(t, l, alert) {
  console.log(alert);
  return '<h3>' + l + '</h3>';
  // return '<h1>' + l + '</h1> <br> <div class="textCircle">' + t[0] + '</div><div class="textCircle">' + t[1] + '</div>' + '</div><div class="textCircle">' + t[2] + '</div>' + '</div><div class="textCircle">' + t[3] + '</div>' + '</div><div class="textCircle">' + t[4] + '</div>' + '</div><div class="textCircle">' + t[5] + '</div>' + '</div><div class="textCircle">' + t[6] + '</div>'
}

String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

function getDayName(dateStr, locale) {
  var date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    weekday: 'long'
  });
}

function panMap(dir, distance){

}

L.Control.Layers.include({
  getOverlays: function() {
    // create hash to hold all layers
    var control, layers;
    layers = {};
    control = this;

    // loop thru all layers in control
    control._layers.forEach(function(obj) {
      var layerName;

      // check if layer is an overlay
      if (obj.overlay) {
        // get name of overlay, only first word
        layerName = obj.name.split(" ")[0];
        // store whether it's present on the map or not
        return layers[layerName] = control._map.hasLayer(obj.layer);
      }
    });

    return layers;
  }
});
