import { loadGeojsonToGeoda } from './loadGeojsonToGeoda.js';

async function getJson(url, gda_proxy){
    const tempData = await fetch(url)
      .then(response => {

        const responseFromJson = response.clone();        

        loadGeojsonToGeoda(responseFromJson, url, gda_proxy);

        return response.json();

      }).then(data => {

        return data

      });     
      
    return tempData;
}
export default getJson;