var MapController = (function(m,pulse,coast,waves){
  var zoomCutOff = 6;
    m.on("zoomend",function(){
      zoomLev = m.getZoom();
      zoomLogic(zoomLev);
      // adjustLineWithZoom(zoomLev);
      console.log("ZOOM END CALLED");
    });
  function zoomLogic(zoom){
    if(zoom<zoomCutOff){
      console.log("Zoom Level: less than", zoomCutOff);
      resetSegments();
      resetAllBoxes();
      m.removeLayer(coastalWarningsLayer);
      m.removeLayer(stationsLayer);
      m.removeLayer(wavesLayer);
      removeOutline();
      closeStations("",true);
      firstTimeClicked = false;

      // myControl.getOverlays()["Tide+SLA"] = true;
        // m.removeLayer(wavesLayer);
      m.addLayer(allPulsesGroup);

    }else{
      console.log("Zoom Level: more than", zoomCutOff);
      // m.addLayer(wavesLayer);
      allPulsesGroup.eachLayer(function(l) {
      if( l instanceof L.Marker && map.getBounds().contains(l.getLatLng()) )
          boxFlow1(l.options.title);
      });
      // if(myControl.getOverlays()["Tide+SLA"])
      if(!m.hasLayer(coastalWarningsLayer)){

        m.addLayer(coastalWarningsLayer);
      // if(myControl.getOverlays()["Tide"])
        // m.addLayer(stationsLayer);
      m.removeLayer(allPulsesGroup);
    }
    updateSegmentsColor(selectedDayIndex);
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
