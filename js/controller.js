var MapController = (function(m,pulse,coast,waves){
  var zoomCutOff = 6;
    m.on("zoomend",function(){
      zoomLev = m.getZoom();
      zoomLogic(zoomLev);
    });
  function zoomLogic(zoom){
    if(zoom<zoomCutOff){
      console.log("Zoom Level: less than", zoomCutOff);
      m.removeLayer(coastalWarningsLayer);
      m.removeLayer(stationsLayer);
      m.removeLayer(wavesLayer);
      // myControl.getOverlays()["Tide+SLA"] = true;
        // m.removeLayer(wavesLayer);
      m.addLayer(allPulsesGroup);
      resetAllBoxes();
    }else{
      console.log("Zoom Level: more than", zoomCutOff);
      // m.addLayer(wavesLayer);
      allPulsesGroup.eachLayer(function(l) {
      if( l instanceof L.Marker && map.getBounds().contains(l.getLatLng()) )
          boxFlow1(l.options.title);
      });
      // if(myControl.getOverlays()["Tide+SLA"])
        m.addLayer(coastalWarningsLayer);
      // if(myControl.getOverlays()["Tide"])
        m.addLayer(stationsLayer);
      m.removeLayer(allPulsesGroup);
    }
  }

  var clickLogic = function(){
    console.log("Map Clicked");
  }

  return{
    handleZoomEvent: zoomLogic,
    handleClickEvent: clickLogic
    }
  });
