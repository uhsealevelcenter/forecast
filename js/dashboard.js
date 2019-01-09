var lineWeight = 20;
var lineWeightWave = 10;
var GREEN = "#7EFF0D";
var YELLOW = "#FCFF05";
var ORANGE = "#FF9A00";
var RED = "#FF310D";
var BLACK = "#000000";
var WHITE = "#FFFFFF";
// var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
var seaLevelLayer = {};
var wavesLayer = {};
var regionAlertLayer = {};

// Loading a geojson file with Sea Level and tide prediction for Oahu coastline
// encoded in LineString
// The file also contains Points which serve to show the pulsating warning
// signals when the map is zoomed out
var mainGeoJSON = new L.GeoJSON.AJAX("TestWaveForecast.geojson");
// , {
//     onEachFeature: getData
//     // Styling each GeoJSON LineString feature based on the
//     // properties.coast_alert_code attribute
//     // style: function(feature) {
//     //     switch (Math.max.apply(null, feature.properties.sl_component.sea_level_forecast)) {
//     //         case 0:
//     //             return {
//     //                 color: GREEN,
//     //                 weight: lineWeight,
//     //                 opacity: 0.75,
//     //                 lineCap: 'round',
//     //                 lineJoin: 'round',
//     //                 pane: 'sealevel'
//     //             };
//     //         case 2:
//     //             return {
//     //                 color: RED,
//     //                 weight: lineWeight,
//     //                 opacity: 0.75,
//     //                 lineCap: 'round',
//     //                 lineJoin: 'round',
//     //                 pane: 'sealevel'
//     //             };
//     //         case 1:
//     //             return {
//     //                 color: ORANGE,
//     //                 weight: lineWeight,
//     //                 opacity: 0.75,
//     //                 lineCap: 'round',
//     //                 lineJoin: 'round',
//     //                 pane: 'sealevel'
//     //             };
//     //
//     //     }
//     // },
//     // Styling each GeoJSON Point feature based on the
//     // properties.islandwide_wave_alert_code attribute so that we can have pulsating alerts
//     // when the map is zoomed out
//     // pointToLayer: function(feature, latlng) {
//     //     var alColor = {};
//     //     switch (feature.properties.region_master_alert_code) {
//     //         case 0:
//     //             alColor = GREEN;
//     //             break;
//     //         case 2:
//     //             alColor = RED;
//     //             break;
//     //         case 1:
//     //             alColor = ORANGE;
//     //             break;
//     //     }
//     //     // create a pulse icon
//     //     var pulse = L.icon.pulse({
//     //         iconSize: [20, 20],
//     //         color: alColor,
//     //         fillColor: alColor,
//     //     });
//     //     // Create a marker at lat,lng that has pulse icon
//     //     var mark = new L.marker(latlng, {
//     //         icon: pulse,
//     //         title: feature.id,
//     //         myCustomOption: "Can Insert Data Here",
//     //     });
//     //     // Added all markers to the markers an array that is added to a Layer to be
//     //     // displayed below
//     //     markers.push(mark);
//     // },
//
//
// });

mainGeoJSON.on('data:progress', function() {
    console.log("Progress");
});
var coastalWarningsLayer = {};
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

    regionAlertLayer = L.geoJSON(geoJsonFormat, {
        // filter: function(feature, layer) {
        //
        //     return feature.properties.show_on_map;
        // }
        pointToLayer: function (feature, latlng) {

          if(feature.properties.show_on_map){
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

    // L.geoJSON(geoJsonFormat.features, {
    //     pointToLayer: function (feature, latlng) {
          // // create a pulse icon
          // var pulse = L.icon.pulse({
          //     iconSize: [20, 20],
          //     color: alColor,
          //     fillColor: alColor,
          // });
          // // Create a marker at lat,lng that has pulse icon
          // var mark = new L.marker(latlng, {
          //     icon: pulse,
          //     title: feature.id,
          //     myCustomOption: "Can Insert Data Here",
          // });
          // // Added all markers to the markers an array that is added to a Layer to be
          // // displayed below
          // markers.push(mark);
    //       console.log("POINT FEATURE", feature);
    //         return L.circleMarker(latlng, geojsonMarkerOptions);
    //     }
    // });

    coastalWarningsLayer.getLayers().forEach(function(layer) {

      switch (Math.max.apply(null, layer.feature.properties.sl_component.sea_level_forecast)) {
          case 0:
              layer.setStyle ({
                  color: GREEN,
                  weight: lineWeight,
                  opacity: 0.75,
                  lineCap: 'round',
                  lineJoin: 'round',
                  pane: 'sealevel'
              });
              break;
          case 2:
              layer.setStyle ({
                  color: RED,
                  weight: lineWeight,
                  opacity: 0.75,
                  lineCap: 'round',
                  lineJoin: 'round',
                  pane: 'sealevel'
              });
              break;
          case 1:
              layer.setStyle ({
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
        // "Positron Label": positronLabels
    };
    //
    //
    L.control.layers(baseMaps, overlayMaps).addTo(map);

    allPulsesGroup = L.layerGroup(markers);
    allPulsesGroup.addTo(map);

    // When a pulsating circle is clicked fly to the location of the circle,
    // remove the pulsating layer and show only LineString features after 3 seconds
    allPulsesGroup.eachLayer(function(layer) {
        layer.on('click', function() {
            console.log("Clik " + this._latlng);
            map.flyTo([this._latlng.lat, this._latlng.lng], 10);
            map.removeLayer(allPulsesGroup);
            $('.item1').children('p').text(this.options.title);
            $(".item2").show();
            // plotData();
            setTimeout(showCoastWarnings, 3000);
        });
    });

  //   L.geoJSON(coastalWarningsLayer, {
  //   onEachFeature: getData
  // });
});


mainGeoJSON.on('data:loading', function() {
    console.log("Loading");
});


// var myTest = $.getJSON( "forecast_wave_component_quasigeo.json", function( data ) {
//   var items = [];
//   $.each( data, function( key, val ) {
//     console.log(val);
//     items.push(val);
//   });
//   return items;
// }).done(function() {
//     console.log( "second success" );
//   })
//   .fail(function() {
//     console.log( "error" );
//   })
//   .always(function() {
//     console.log( "complete" );
//   });

// loads in a wave geojson file and styles the Leaflet layer based on
// the properties.coast_alert_code attribute
// var wavesLayer = new L.GeoJSON.AJAX("TestWaveForecast.geojson", {
//
//     style: function(feature) {
//       return {
//           color: "white",
//           weight: lineWeightWave,
//           opacity: 1.0,
//           lineCap: 'round',
//           lineJoin: 'round',
//           interactive: false
//       };
//     }
// });

// Use a setText plugin on waves layer data to add text symbols to it so that
// it looks different from the SeaLevel/Tide data
// wavesLayer.on('data:loaded', function() {
//     console.log("WAVES LOADED");
//
//     wavesLayer.getLayers().forEach(function(layer) {
//       // console.log("TST", layer.feature.properties.wave_component_alert_code);
//       if(layer.feature.properties.wave_component_alert_code != null)
//         {
//           switch (Math.max.apply(null, layer.feature.properties.wave_component_alert_code)) {
//
//             case 2:
//                 layer.setText('~', {
//                     repeat: true,
//                     offset: 9,
//                     attributes: {
//                         fill: RED,
//                         'font-weight': 'bold',
//                         'font-size': '24',
//                         'rotate': 0,
//                     }
//                 });
//                 break;
//             case 1:
//             console.log("HERE");
//                 layer.setText('~', {
//                     repeat: true,
//                     offset: 9,
//                     attributes: {
//                         fill: ORANGE,
//                         'font-weight': 'bold',
//                         'font-size': '24',
//                         'rotate': 0,
//                     }
//                 });
//                 break;
//             case 0:
//                 layer.setText('~', {
//                     repeat: true,
//                     offset: 9,
//                     attributes: {
//                         fill: GREEN,
//                         'font-weight': 'bold',
//                         'font-size': '24',
//                         'rotate': 0,
//                     }
//                 });
//                 break;
//             default:
//             layer.setText('~', {
//                 repeat: true,
//                 offset: 9,
//                 attributes: {
//                     fill: GREEN,
//                     'font-weight': 'bold',
//                     'font-size': '24',
//                     'rotate': 0,
//                 }
//             });
//
//         }
//       }else{
//         // console.log("VALUE IS NULL");
//       }
//
//     });
//
// });



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

var closestLayer = null;

function getData(feature, layer) {
  console.log("GETDATA");
    var time = feature.properties.sl_component.time;
    var tide = feature.properties.tide_values;
    var msl_obs = feature.properties.sealevel_obs;
    var msl_for = feature.properties.sealevel_for;
    var location = feature.id;
    var sl_alerts = feature.properties.sl_component.sea_level_forecast;
    var extremeHigh = feature.properties.extreme_high;
    // var wave = [17,18,19,20,18,17,16,15,16,17,18,15,16,17]

    // layer.bindPopup('<h2>' +location + '</h2> <br>'+feature.properties.alert_sealevel+'<br>'+time);

    // layer.bindPopup('<iframe id="ifr" src="./myPopup.html"></iframe>');
    // $('#ifr').contents().find('body').find('h1').innerText = "NEMA"
    // layer.bindPopup()

    // var popup = new L.Popup();

    // layer.bindPopup(popup);

    layer.on("click", function(e) {
        // console.log("Clik "+feature.id);
        // console.log(feature.properties.alert_sealevel);
        // console.log($('#ifr').contents().find('body').find('h1').innerText);

        // Finds the wave layer closest to the clicked location and gets the wave data
        closestLayer = L.GeometryUtil.closestLayer(map, wavesLayer.getLayers(), e.latlng)

        $.getJSON('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + e.latlng.lat + '&lon=' + e.latlng.lng, function(data) {
            //data is the JSON string
            // console.log("json respom",data.display_name);

            location = data.display_name;
            var wave = closestLayer.layer.feature.properties.wave_component_alert_code
            // Remove plotting for now
            // plotData(time, tide, msl_obs, msl_for, wave, extremeHigh, location);
            // console.log("LOCATION: ", location);
            $('.item2').children('p').text(location);
            $(".item3").show();

            //clear the table
            $('#datatable tr:has(td)').remove();
            for (var i = 0; i < 7; i++) {
                var dateString = time[i + 8].slice(0, -3);
                var d = new Date(dateString);
                var dayName = getDayName(d, "en-US");
                $('#datatable').append(
                    $('<tr>').append(
                        $('<td>').append(sl_alerts[i + 8]
                            // $('').attr('href', 'https://www.google.com')
                            // .addClass('selectRow')
                            // .text(i+"N")
                        ),
                        $('<td>').append(wave[i]
                            // $('<a>').attr('href', 'https://www.blic.rs')
                            // .addClass('imgurl')
                            // .attr('target', '_blank')
                            // .text(i+"K")
                        ),
                        $('<td>').append(dayName),
                        $('<td>').append(dateString)
                    )
                );
            }

            // popup.setContent(assemblePopup(time, location, sl_alerts))
        });
        // console.log(e.latlng.lat);
        // https://nominatim.openstreetmap.org/reverse?format=json&lat=21.2960920&lon=-158.1063080


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




    });

};
$(document).ready(function() {
    $("#datatable").delegate("tr", "click", function() {
        $(".item4").show();
    });
});
var theParent = document.getElementById("overlayParent");
theParent.addEventListener("click", closeBox, false);


function closeBox(e) {
    if (e.target.nodeName === "SPAN") {
        if ($(e.target.parentNode).hasClass("item1")) {

        } else {
            $(e.target.parentNode).hide();
            if ($(e.target.parentNode).hasClass("item2") || $(e.target.parentNode).hasClass("item3")) {
                $(".item3").hide();
                $(".item4").hide();
            }
        }
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
