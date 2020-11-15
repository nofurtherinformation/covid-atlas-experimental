import * as d3 from 'd3-dsv';

async function getParseCSV(url, joinCol){
    const tempData = await fetch(url)
      .then(response => {
        return response.ok ? response.text() : Promise.reject(response.status);
      }).then(text => {
        let data = d3.csvParse(text, d3.autoType)
        let rtn = {};
        let n = data.length;
        while (n>0){
          n--;
          rtn[data[n][joinCol]] = Object.values(data[n])
        }
        return [rtn, Object.keys(data[0])]
      });
    return tempData;
}

export default getParseCSV