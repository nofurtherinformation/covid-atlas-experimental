import { loadGeojsonToGeoda, getGeoidIndex } from '../utils';

async function getJson(url, gda_proxy){
    const tempData = await fetch(url)
      .then(response => {

        const responseFromJson = response.clone();        

        loadGeojsonToGeoda(responseFromJson, url, gda_proxy);

        return response.json();

      }).then(data => {
        console.log(getGeoidIndex(data.features))

        return {
          data: data,
          geoidIndex: getGeoidIndex(data.features)
        }
        
      });     
      
    return tempData;
}
export default getJson;