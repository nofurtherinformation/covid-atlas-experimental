// workerfile.js
var self = window;

export default () => {
    
    self.addEventListener("message", e => {
      // eslint-disable-line no-restricted-globals
      if (!e) return;

      let proxy = e.data.proxy;
  
      // let nb = proxy.custom_breaks(
      //   e.data.geojson, 
      //   e.data.mapParams.mapType,
      //   e.data.mapParams.nBins,
      //   null, 
      //   e.data.binData
      // ) 

      postMessage(proxy);
    });
  };