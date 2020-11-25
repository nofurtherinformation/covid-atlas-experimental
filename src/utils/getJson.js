import { loadGeojsonToGeoda, getGeoidIndex } from '../utils';
import { sortBy } from 'lodash';

async function getJson(url, gda_proxy){
    const tempData = await fetch(url)
      .then(response => {
        const responseFromJson = response.clone();        
        loadGeojsonToGeoda(responseFromJson, url, gda_proxy);
        return response.json();
      }).then(data => {
        // data.features = sortBy(data.features, [f => f.properties.GEOID])
        return {
          data: data,
          geoidIndex: getGeoidIndex(data.features)
        }
      });        
    return tempData;
}
export default getJson;