var MapController = (function(m,pulse,coast,waves){
  var zoomCutOff = 5;
    m.on("zoomend",function(){
      zoomLev = m.getZoom();
      zoomLogic(zoomLev);
    });
  function zoomLogic(zoom){
    if(zoom<zoomCutOff){
      console.log("Zoom Level: less than 5");
      m.removeLayer(coastalWarningsLayer);
        // m.removeLayer(wavesLayer);
      m.addLayer(allPulsesGroup);
    }else{
      console.log("Zoom Level: more than 5");
      // m.addLayer(wavesLayer);
      m.addLayer(coastalWarningsLayer);
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
