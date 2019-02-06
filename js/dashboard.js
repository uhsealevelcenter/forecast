var lineWeight = 20;
var lineWeightWave = 10;
var GREY = "#aaaaaa";
var YELLOW = "#FCFF05";
var ORANGE = "#FF9A00";
var RED = "#FF310D";
var BLACK = "#000000";
var WHITE = "#FFFFFF";
var MAX_ZOOM = 11;
var MIN_ZOOM = 3;

// var streets_l = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
//   maxZoom: 12,
//   minZoom: 2,
//   // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
//   // 	'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
//   // 	'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//   id: 'mapbox.light'
// });
//
// var streets_d = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
//   maxZoom: 12,
//   minZoom: 2,
//   // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
//   // 	'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
//   // 	'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//   id: 'mapbox.dark'
// });

var streets_s = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
  maxZoom: MAX_ZOOM,
  minZoom: MIN_ZOOM,
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox.satellite'
});


var markers = [];
var allPulsesGroup = {};
var seaLevelLayer = {};
var wavesLayer = {};
var regionAlertLayer = {};
var stationsLayer = {};
var selectedDayIndex = 0;
var firstTimeClicked = false;

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
// var sidebar = null;
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
            alertColor = GREY;
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

  // coastalWarningsLayer.getLayers().forEach(function(layer) {
  //
  //   switch (Math.max.apply(null, layer.feature.properties.sl_component.sea_level_forecast)) {
  //     case 0:
  //       layer.setStyle({
  //         color: GREY,
  //         weight: lineWeight,
  //         opacity: 0.75,
  //         lineCap: 'round',
  //         lineJoin: 'round',
  //         pane: 'sealevel'
  //       });
  //       break;
  //     case 2:
  //       layer.setStyle({
  //         color: RED,
  //         weight: lineWeight,
  //         opacity: 0.75,
  //         lineCap: 'round',
  //         lineJoin: 'round',
  //         pane: 'sealevel'
  //       });
  //       break;
  //     case 1:
  //       layer.setStyle({
  //         color: ORANGE,
  //         weight: lineWeight,
  //         opacity: 0.75,
  //         lineCap: 'round',
  //         lineJoin: 'round',
  //         pane: 'sealevel'
  //       });
  //       break;
  //   }
  // });



  // wavesLayer.getLayers().forEach(function(layer) {
  //   // console.log("TST", layer.feature.properties.wave_component_alert_code);
  //   if (layer.feature.properties.wave_component_alert_code != null) {
  //     switch (Math.max.apply(null, layer.feature.properties.wave_component_alert_code)) {
  //
  //       case 2:
  //         layer.setText('~', {
  //           repeat: true,
  //           offset: 9,
  //           attributes: {
  //             fill: RED,
  //             'font-weight': 'bold',
  //             'font-size': '24',
  //             'rotate': 0,
  //           }
  //         });
  //         break;
  //       case 1:
  //         layer.setText('~', {
  //           repeat: true,
  //           offset: 9,
  //           attributes: {
  //             fill: ORANGE,
  //             'font-weight': 'bold',
  //             'font-size': '24',
  //             'rotate': 0,
  //           }
  //         });
  //         break;
  //       case 0:
  //         layer.setText('~', {
  //           repeat: true,
  //           offset: 9,
  //           attributes: {
  //             fill: GREY,
  //             'font-weight': 'bold',
  //             'font-size': '24',
  //             'rotate': 0,
  //           }
  //         });
  //         break;
  //       default:
  //         layer.setText('~', {
  //           repeat: true,
  //           offset: 9,
  //           attributes: {
  //             fill: GREY,
  //             'font-weight': 'bold',
  //             'font-size': '24',
  //             'rotate': 0,
  //           }
  //         });
  //
  //     }
  //   } else {
  //     // console.log("VALUE IS NULL");
  //   }
  //
  // });
  //
  // wavesLayer.setStyle({
  //   color: "white",
  //   weight: lineWeightWave,
  //   opacity: 1.0,
  //   lineCap: 'round',
  //   lineJoin: 'round',
  //   interactive: false
  // });

  // Map overlays (SLA, Waves layer)
  // Can have multiple active at a time
  var overlayMaps = {
    // "Tide+SLA Warning": coastalWarningsLayer,
    // "Wave Warning": wavesLayer,
    "All Tide Gauges": stationsLayer,
  };
  //
  //
  myControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

  // sidebar = L.control.sidebar('sidebar', {
  //   position: 'right'
  // });
  // map.addControl(sidebar);


  allPulsesGroup = L.layerGroup(markers);
  allPulsesGroup.addTo(map);

  // When a pulsating circle is clicked fly to the location of the circle,
  // remove the pulsating layer and show only LineString features after 3 seconds
  allPulsesGroup.eachLayer(function(layer) {
    layer.on('click', function() {
      // console.log("Clik " + this._latlng);
      map.flyTo([this._latlng.lat, this._latlng.lng], 8);
      map.removeLayer(allPulsesGroup);
      map.setMaxZoom(MAX_ZOOM);
      boxFlow1(this.options.title);

      // plotData();
      setTimeout(showCoastWarnings, 1900);
    });
  });


  // Display tide gauge info on hover
  stationsLayer.eachLayer(function(layer) {
    layer.bindPopup("<b>Station:</b> " + layer.feature.properties.stat_name+"<br>"+
  "<b>Location:</b> "+layer.feature.geometry.coordinates+"<br>"+
"<b>Data Provider:</b> <a href=\"https://tidesandcurrents.noaa.gov\" target=\"_blank\">NOAA</a>");
    layer.on('mouseover', function(e) {
      // this.openPopup();
    });
    layer.on('mouseout', function(e) {
      // this.closePopup();
    });

    // layer.on('click', function() {
    //   sidebar.toggle();
    // });

  });

  // var popup = new L.Popup();
  //
  // coastalWarningsLayer.bindPopup(popup);
  // Layer click handler
  coastalWarningsLayer.on('click', function(e) {
    var time = e.layer.feature.properties.sl_component.time.slice(-7, e.layer.feature.properties.sl_component.time.length);
    // // var location = feature.id;
    var sl_alerts = e.layer.feature.properties.sl_component.sea_level_forecast;

    // Finds the wave layer closest to the clicked location and gets the wave data
    // var closestLayer = L.GeometryUtil.closestLayer(map, wavesLayer.getLayers(), e.latlng);

    // unselectLayer();
    onAddInfoClose();
    // e.layer.setStyle({
    //   weight: getLineWeight(),
    //   opacity: 1.0
    // });

    // e.layer.setText('~', {
    //   repeat: true,
    //   offset: 9,
    //   attributes: {
    //     fill: 'white',
    //     'font-weight': 'bold',
    //     'font-size': '24',
    //     'rotate': 0,
    //   }
    // });

    // var polyline = L.polyline(e.layer._latlngs, {
    //   color: 'black',
    //   weight: getLineWeight()*3
    // }).addTo(map);
    // polyline.bringToBack();
    e.layer.feature.properties["selected_layer"] = true;
    setOutline(e.layer);
    e.layer.bringToFront();

    map.setView(e.layer._latlngs[0],MAX_ZOOM-1);


    // var statCode = e.layer.feature.properties.sl_component.station;
    // var singleStation = getStationLayer(statCode);
    //
    // singleStation.addTo(map);
    // singleStation.openPopup();
    // closeStations(statCode,false);

    $(".lds-facebook").show();
    $.getJSON('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + e.latlng.lat + '&lon=' + e.latlng.lng + '&zoom=' + 14, function(data) {
      //data is the JSON string
      // console.log("json respom",data.display_name);

      // var location = data.display_name.split(",").slice(0, 3);
      $(".lds-facebook").hide();
      var city = data.address.city;
      var village = data.address.village;
      var state = data.address.state;
      var county = data.address.county;
      var zip = data.address.postcode;
      var location = []; //data.address.city + ", " + data.address.state + ", " + data.address.postcode;

      // Show small town name if available, if not show city, if not show county
      // Always show state and zip (zip might not always be available)
      if (typeof village !== "undefined")
        location.push(village);
      else {
        if (typeof city !== "undefined") {
          location.push(city);
        } else {
          location.push(county);
        }
      }
      location.push(state);
      location.push(zip);
      selectedFeature = e.layer.feature;
      var wave = e.layer.feature.properties.wave_component_alert_code
      // Remove plotting for now
      // plotData(time, tide, msl_obs, msl_for, wave, extremeHigh, location);
      // console.log("LOCATION: ", location);
      // var newMarker = new L.marker(e.latlng).addTo(map);
      var highestAlerts = [];
      var highInd;

      if (!firstTimeClicked) {
        if (wave === null) {
          highestAlerts = sl_alerts;
        } else {
          highestAlerts = wave.map(function(item, i) {
            return Math.max(item, sl_alerts[i])
          });
        }
        selectedDayIndex = indexOfMax(highestAlerts);
        firstTimeClicked = true;
      }

      for (var i = 0; i<location.length; i++){
        location[i] = " "+location [i] ;
      }
      boxFlow2(location, time, sl_alerts, wave);
      updateDetailsBox(selectedDayIndex);
      // popup.setContent(assemblePopup(time, location, sl_alerts))
    }).always(function(){
      // console.log("always");
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
  maxZoom: MAX_ZOOM,
  minZoom: MIN_ZOOM,
  attribution: cartodbAttribution
});

var positronLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
  maxZoom: MAX_ZOOM,
  minZoom: MIN_ZOOM,
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

map.setMaxZoom(3);

// Craating panes and assigning zIndex so that Sea Level layer always shows below
// the waves layer but the labels of the positron maps show all the way on top
map.createPane('sealevel');
map.getPane('sealevel').style.zIndex = 399;
// Creating a slightly higher layer for a selected coastline segment so that
// the adjacent layer does not overlap the selected layer
map.createPane('sealeveltop');
map.getPane('sealeveltop').style.zIndex = 600;
// map.getPane('sealevel').style.pointerEvents = 'none';

map.createPane('labels');
map.getPane('labels').style.zIndex = 700;
// Prevent labels from capturing clicks
map.getPane('labels').style.pointerEvents = 'none';

// Creating a selection of maps
// Only one can be active at a time
var baseMaps = {
  // "Light": streets_l,
  // "Dark": streets_d,
  "Satellite": streets_s,
  "Light": positronGroup,
};

function showCoastWarnings() {
  // wavesLayer.addTo(map);
// updateSegmentsColor(selectedDayIndex);
  coastalWarningsLayer.addTo(map);
  // stationsLayer.addTo(map);
  $(".infoBubble").show();

  // console.log("SHOW COAST WARNING CALLED");
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
  $('#overlayParent').each(function () {
    L.DomEvent.on(this,'mousedown',L.DomEvent.stop);
    L.DomEvent.on(this,'click',L.DomEvent.stop);
    L.DomEvent.on(this,'touchstart',L.DomEvent.stop);
});
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


    // Remove existing arrow befor adding new one
    $("#datatable tr").removeClass("selectedRow")
    $(this).parent().addClass('selectedRow');

    // Fade out unselected rows
    $('#datatable').children('tr').each(function(i, obj) {
      if (obj.classList.contains("selectedRow"))
        $(this).css("opacity", "1.0");
      else
        $(this).css("opacity", "0.5");
    });

    var rowClicked = $(this).parent().index() - 1;
    selectedDayIndex = rowClicked;
    updateSegmentsColor(selectedDayIndex);
    updateDetailsBox(rowClicked);
  });

  $('.info').click(function(e){
    e.stopPropagation();
    var statCode = $('#tideGauge').text().slice(0,4).toLowerCase();
    var singleStation = getStationLayer(statCode);
    singleStation.addTo(map);
    singleStation.openPopup();
    closeStations(statCode,false);
    $("#tideInfo").hide();
    $("#addTideInfo").show();
  });
});





function updateDetailsBox(row) {
  $(".infoBubble").hide();
  $(".item4").show();
  if (selectedFeature.properties.swell_height !== null) {
    var sh = selectedFeature.properties.swell_height[row];
    var sp = selectedFeature.properties.swell_period[row];
    var sd = selectedFeature.properties.swell_direction[row];
    $("#swellValues").text("{0} m @ {1}s from {2}".format(sh, sp, sd));
    var waveValueAr = selectedFeature.properties.wave_component_water_level[row];
    if(waveValueAr[0]==0 & waveValueAr[1]==0){
      $("#waveValue").text("0 cm");
    }else {
      $("#waveValue").text("{0}-{1} cm".format(waveValueAr[0], waveValueAr[1]));
    }


    switch (selectedFeature.properties.wave_component_alert_code[row]) {
      case 0:
        $("#waveWarning").css("background-color", GREY);
        $("#waveWarning").text("TYPICAL");
        $("#waveAlert h2").css("color", GREY);
        $("#waveWarningText").text("No significant impact is expected due to wave runup");
        break;
      case 1:
        $("#waveWarning").css("background-color", ORANGE);
        $("#waveWarning").text("MODERATE");
        $("#waveAlert h2").css("color", ORANGE);
        $("#waveWarningText").text("Minor coastal erosion and over wash is possible in vulnerable areas; worsened by higher tides.");
        break;
      case 2:
        $("#waveWarning").css("background-color", RED);
        $("#waveWarning").text("EXTREME");
        $("#waveAlert h2").css("color", RED);
        $("#waveWarningText").text("Significant coastal erosion and over wash is possible in vulnerable areas; worsened by higher tides.");
        break;
      default:

    }

  } else {

    $("#swellValues").text("-");
    $("#waveValue").text("-");
    $("#waveWarning").css("background-color", GREY);
    $("#waveWarning").text("NO DATA");
    $("#waveAlert h2").css("color", GREY);
    $("#waveWarningText").text("No forecast available for this coastline segment.");
  }


  switch (selectedFeature.properties.sl_component.sea_level_forecast[row]) {
    case 0:
      $("#tideWarning").css("background-color", GREY);
      $("#tideWarning").text("TYPICAL");
      $("#tideAlert h2").css("color", GREY);
      $("#tideWarningText").text("No significant impact is expected in areas vulnerable to tidal fooding.");
      break;
    case 1:
      $("#tideWarning").css("background-color", ORANGE);
      $("#tideWarning").text("MODERATE");
      $("#tideAlert h2").css("color", ORANGE);
      $("#tideWarningText").text("Minor impacts possible during brief periods around high tide in areas vulnerable to tidal fooding.");
      break;
    case 2:
      $("#tideWarning").css("background-color", RED);
      $("#tideWarning").text("EXTREME");
      $("#tideAlert h2").css("color", RED);
      $("#tideWarningText").text("Beach overwash and/or standing water is possible in vulnerable areas");
      break;
    default:

  }

  var tideValue = selectedFeature.properties.sl_component.tide_values[row];
  var hour = selectedFeature.properties.sl_component.time[row].slice(-2, selectedFeature.properties.sl_component.time[row].length);
  var tideGaugeName = selectedFeature.properties.sl_component.station;
  // add minutes
  hour = hour + ":00";
  $("#tideValue").text(selectedFeature.properties.sl_component.tide_values[row] + " cm");
  if (selectedFeature.properties.sl_component.tide_values[row] > 0) {
    $("#tideValue").text(tideValue + " cm above average");
    $("#tideValue").append(
      $('<img width= 15px; height = 15px; class="infoImg">').attr('src', 'assets/info_icon_gray.svg')
    );
    $("#tideGaugeValue").text(tideValue + " cm above MHHW @ "+hour);
  } else if (selectedFeature.properties.sl_component.tide_values[row] < 0) {
    $("#tideValue").text(tideValue + " cm below average");
    $("#tideValue").append(
      $('<img width= 15px; height = 15px; class="infoImg">').attr('src', 'assets/info_icon_gray.svg')
    );
    $("#tideGaugeValue").text(tideValue + " cm below MHHW @ "+hour);
  } else {
    if (selectedFeature.properties.sl_component.tide_values[row] == 0){
      $("#tideValue").text("About average");
      $("#tideValue").append(
        $('<img width= 15px; height = 15px; class="infoImg">').attr('src', 'assets/info_icon_gray.svg')
      );
      $("#tideGaugeValue").text("About average @ "+hour);
    }else {
      $("#tideValue").text("No data");
      $("#tideGaugeValue").text("No data");
    }
  }

    $("#tideGauge").text(getStationName(tideGaugeName) + " (see blue marker)");

  var mslValue = selectedFeature.properties.sl_component.msl_values[row];
  $("#mslValue").text(selectedFeature.properties.sl_component.msl_values[row] + " cm");
  if (selectedFeature.properties.sl_component.msl_values[row] > 0) {
    $("#mslValue").text(mslValue + " cm above average");
  } else if (selectedFeature.properties.sl_component.msl_values[row] < 0) {
    $("#mslValue").text(mslValue + " cm below average");
  } else {
    if (selectedFeature.properties.sl_component.msl_values[row] == 0)
      $("#mslValue").text("About average");
    else {
      $("#mslValue").text("No data");
    }
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
    if ( parentContainer.hasClass("item3")) {
      boxClose3();
    }
    if (parentContainer.hasClass("item4")) {
      // map.panBy([$(".item4").width(), 0], {
      //   duration: 0.5
      // });
      $(".item4").hide();

    }

    if (parentContainer.hasClass("additional")) {
      onAddInfoClose();

    }

  }
}
function onAddInfoClose(){
  $("#tideInfo").show();
  $("#addTideInfo").hide();
  closeStations("",true);
}

function boxClose2(){
  $('.item2').children('p').text("Choose from map");
  $('.item2').children('p').css("font-style","italic");
  // reset coastline segments to highest alert;
  $(".infoBubble").hide();
  firstTimeClicked = false;
  updateSegmentsColor(0);
  unselectLayer();

  $(".item3").hide();
  $(".item4").hide();

  closeStations("",true);
  removeOutline();
  map.setZoom(3);
}

function boxClose3() {
  // if ($('.item2').children('p').text() != "Choose from map") {
  //   if ($(".item3").is(":visible")) {
  //     map.panBy([$(".item3").width(), 0], {
  //       duration: 0.5
  //     });
  //   }
  //   if ($(".item3").is(":visible") & $(".item3").is(":visible")) {
  //     map.panBy([$(".item3").width(), 0], {
  //       duration: 0.5
  //     });
  //   }
  // }
  // map.setZoom(8);
  map.fitBounds(coastalWarningsLayer.getBounds());
  $('.item2').children('p').text("Choose from map");
  $('.item2').children('p').css("font-style","italic");
  // reset coastline segments to highest alert;
  $(".infoBubble").show();
  firstTimeClicked = false;
  updateSegmentsColor(0);
  unselectLayer();

  $(".item3").hide();
  $(".item4").hide();

  closeStations("",true);
  removeOutline();
}

function resetAllBoxes() {
  $('.item1').children('p').text("Choose from map");
  $('.item1').children('p').css("font-style","italic");
  $('.item2').children('p').css("font-style","italic");
  $(".item2").hide();
  $(".item3").hide();
  $(".item4").hide();
}

function boxFlow1(title) {
  $('.item1').children('p').text(title);
  $('.item1').children('p').css("font-style","normal");
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
  $('.item2').children('p').css("font-style","normal");
  // Move move so that the table doesn't obscure the view
  if ($('.item3').is(":hidden")) {
    // map.panBy([-325, 0], {
    //   duration: 0.5
    // });


  }
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
  } else {

  }

  //clear the table
  $('#datatable tr:has(td)').remove();
  for (var i = 0; i < 7; i++) {
    var dateString = t[i].slice(0, -3);
    var d = new Date(dateString).toLocaleString("en-US", {
      timeZone: "Europe/London"
    });
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
        srcStringW = "css/none.svg";
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
        $('<td>').append(dateString).addClass('dateColumn')
      )
    );
  }

  // Have a day automatically selected in the table
  //The css child index is 1 based
  var index = selectedDayIndex + 1;
  // Update segment coloring to reflect the automatically selected day
  updateSegmentsColor(selectedDayIndex);
  $("#datatable tr:eq(" + index + ")").addClass('selectedRow');
  // Fade out unselected rows
  $('#datatable').children('tr').each(function(i, obj) {
    if (obj.classList.contains("selectedRow"))
      $(this).css("opacity", "1.0");
    else
      $(this).css("opacity", "0.5");
  });

}

function assemblePopup(t, l, alert) {
  console.log(alert);
  return '<h3>' + l + '</h3>';
  // return '<h1>' + l + '</h1> <br> <div class="textCircle">' + t[0] + '</div><div class="textCircle">' + t[1] + '</div>' + '</div><div class="textCircle">' + t[2] + '</div>' + '</div><div class="textCircle">' + t[3] + '</div>' + '</div><div class="textCircle">' + t[4] + '</div>' + '</div><div class="textCircle">' + t[5] + '</div>' + '</div><div class="textCircle">' + t[6] + '</div>'
}

String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

// For string formating as per :
// https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined' ?
        args[number] :
        match;
    });
  };
}

function getDayName(dateStr, locale) {
  var date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    weekday: 'long'
  });
}

function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
}

function panMap(dir, distance) {

}

// Updates coastline style based on the day selection,zoom level, and coastline
function updateSegmentsColor(day) {
  console.log("UPDATE SEGMENTS CALLED");
  var highestAlert;
  var segmentOpacity = 1.0;
  var layerLevel;
  var lweight = getLineWeight();

  // var antPoly;

  coastalWarningsLayer.getLayers().forEach(function(layer) {
    // console.log("FIRST TIME CLICKED",firstTimeClicked);
    // If a coastline segment hasn't been clicked yet, find the highest alert
    // for each coastline and style segments accordingly
    // If a coastline segment is selected, find the highest alert for the day
    // selected for each of the coastlines
    if (!firstTimeClicked) {
      highestAlert = Math.max(Math.max.apply(null,layer.feature.properties.wave_component_alert_code), Math.max.apply(null,layer.feature.properties.sl_component.sea_level_forecast));
    } else {
      if (layer.feature.properties.wave_component_alert_code === null) {
        highestAlert = Math.max(null, layer.feature.properties.sl_component.sea_level_forecast[day]);

      } else {
        highestAlert =
          Math.max(layer.feature.properties.sl_component.sea_level_forecast[day],
            layer.feature.properties.wave_component_alert_code[day]);
      }
    }

    if (layer.feature.properties["selected_layer"] === true) {
      layer.feature.properties["selected_layer"] = false;
      lineWeight = getLineWeight();
      segmentOpacity = 1.0;
      layerLevel = 'overlayPane';
      // console.log("LAYER SELECTED");
      // layer.bringToFront();
      // layer.setText('~', {
      //   repeat: true,
      //   offset: 9,
      //   attributes: {
      //     fill: 'white',
      //     'font-weight': 'bold',
      //     'font-size': '24',
      //     'rotate': 0,
      //   }
      // });
//       console.log(layer._latlngs);
//       antPoly = L.polyline.antPath(layer._latlngs, {
//   "delay": 250,
//   "dashArray": [
//     20,
//     50
//   ],
//   "weight": 40,
//   "color": "#FFFFFFFF",
//   "pulseColor": "#FFFFFF",
//   "paused": false,
//   "reverse": false,
//   "hardwareAccelerated": true
// });
// antPoly.addTo(map);
    } else {
      lineWeight = lweight;
      segmentOpacity = 1.0;
      layerLevel = 'overlayPane';
      // layer.setText('', {});
      // if(typeof antPoly != 'undefined')
      // antPoly.remove();
    }

    //update the outline line weight
    map.eachLayer(function(layer){
    if(layer instanceof L.Polyline & layer.options.outline)
      layer.setStyle({
        weight: getLineWeight()*1.5
        // pane: 'sealevel'
      });
    });

    switch (highestAlert) {
      case 0:
        layer.setStyle({
          color: GREY,
          weight: lineWeight,
          opacity: segmentOpacity,
          lineCap: 'round',
          lineJoin: 'round',
          pane: layerLevel
        });
        break;
      case 2:
        layer.setStyle({
          color: RED,
          weight: lineWeight,
          opacity: segmentOpacity,
          lineCap: 'round',
          lineJoin: 'round',
          pane: layerLevel
        });
        break;
      case 1:
        layer.setStyle({
          color: ORANGE,
          weight: lineWeight,
          opacity: segmentOpacity,
          lineCap: 'round',
          lineJoin: 'round',
          pane: layerLevel
        });
        break;
    }
  });
}

// Reset all layers to the original style
function unselectLayer() {
  console.log("RESET CALLED");
  var lweight  = getLineWeight();
  coastalWarningsLayer.getLayers().forEach(function(layer) {
    layer.feature.properties["selected_layer"] = false;
    // layer.setStyle({
    //   weight: lweight,
    //   opacity: 1.0,
    //   lineCap: 'round',
    //   lineJoin: 'round',
    //   pane: 'sealevel'
    // });
    // layer.setText('', {});
  });

}

function getLineWeight(){
  return (10*(6-map.getZoom())+5*(map.getZoom()-MAX_ZOOM))/(6-MAX_ZOOM)
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


function getStationName(statCode) {
  var name;
  stationsLayer.eachLayer(function(layer) {
    if (layer.feature.id == statCode) {
      name = layer.feature.properties.stat_name;
      return;
    }
  });
  return name;
}

function getStationLayer(statCode) {
  var my_layer;
  stationsLayer.eachLayer(function(layer) {
    if (layer.feature.id == statCode) {
      my_layer = layer;
      return;
    }
  });
  return my_layer;
}

function closeStations(currStat, all){
  stationsLayer.eachLayer(function(layer) {
    if(all){
      layer.remove();
    }else{
    if (layer.feature.id != currStat) {
      layer.remove();
    }
  }
  });
}

function setOutline(layer){
  map.eachLayer(function(layer){
  if(layer instanceof L.Polyline & layer.options.outline)
    layer.remove();
  });
  var polyline = L.polyline(layer._latlngs, {
    color: 'white',
    outline: true,
    pane: 'overlayPane',
    weight: getLineWeight()*1.5
  }).addTo(map);
  // polyline.bringToBack();
}

function removeOutline(){
  map.eachLayer(function(layer){
  if(layer instanceof L.Polyline & layer.options.outline)
    layer.remove();
  });
}

function centerPixelToCoordinates(container){
  var cX = container.offset().left + container.width()/2;
  var cY = container.offset().top + container.height()/2;

  return map.containerPointToLatLng([cX,cY]);
}
