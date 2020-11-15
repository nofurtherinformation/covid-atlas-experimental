import React, { useEffect } from 'react';
import { setCentroids, storeData, setGeodaProxy, setCurrentData, setDates, setColumnNames, setDate, setDateIndex, setBins, set3D } from './actions';
import { useSelector, useDispatch } from 'react-redux';
import GeodaProxy from './GeodaProxy.js';
import { getParseCSV, getJson, mergeData, colIndex, getDataForBins } from './utils';
import { Map, DateSlider } from './components';

function App() {
  const storedData = useSelector(state => state.storedData);
  const currentData = useSelector(state => state.currentData);
  const gda_proxy = useSelector(state => state.geodaProxy);
  const dataFn = useSelector(state => state.currentDataFn);
  const columnNames = useSelector(state => state.cols);
  const currDate = useSelector(state => state.currDate);
  const currDateIndex = useSelector(state => state.currDateIndex);
  const dates = useSelector(state => state.dates);
  const bins = useSelector(state => state.bins);
  const binMode = useSelector(state => state.binMode);

  const dispatch = useDispatch();  
  
  const getCentroids = (geojson, gda_proxy) =>  dispatch(setCentroids(gda_proxy.GetCentroids(geojson), geojson))
  
  const getDates = (data, table, geojson) =>  {
    let dates = findDates(data[table])
    dispatch(setDates(dates, geojson))
    dispatch(setDate(dates.slice(-1,)[0]))
    dispatch(setDateIndex(colIndex(data, table, dates.slice(-1,)[0])))
  }

  const findDates = (data) => {
    for (let i = 0; i < data.length; i++) {
      if (Date.parse(data[i])) {
        return data.slice(i,)
      }
    }
    return;
  }

  const getColumns = (data, names) => {
    let rtn = {};
    for (let i=0; i < data.length; i++) {
      rtn[names[i]] = data[i][1]
    }
  return rtn;
  }

  async function loadData(geojson, csvs, joinCols, names) {
    const csvPromises = csvs.map(csv => getParseCSV(`${process.env.PUBLIC_URL}/csv/${csv}.csv`, joinCols[1]).then(result => {return result}))
    Promise.all([
      getJson(`${process.env.PUBLIC_URL}/geojson/${geojson}`, gda_proxy),
      ...csvPromises
    ]).then(values => {
      // console.log(values.slice(1,))
      dispatch(storeData(mergeData(values[0], joinCols[0], values.slice(1,), names, joinCols[1]),geojson));
      dispatch(setCurrentData(geojson))
      dispatch(setColumnNames(getColumns(values.slice(1,), names), geojson))
    })    
  }

  // After runtime is initialized, this loads in gda_proxy to the state
  useEffect(() => {
    if (gda_proxy === null) {
      dispatch(setGeodaProxy(new GeodaProxy()))
    }
  },[window.Module])

  // on initial load and after gda_proxy has been initialized, this loads in the default data sets (USA Facts)
  useEffect(() => {
    if ((gda_proxy != null) && (currentData == '')) {
      loadData(
        'county_usfacts.geojson', 
        ['covid_confirmed_usafacts','covid_deaths_usafacts', 'berkeley_predictions', 'chr_health_context', 'chr_life', 'chr_health_factors'], 
        ['GEOID', 'FIPS'], 
        ['cases','deaths', 'predictions', 'chr_health_context', 'chr_life', 'chr_health_factors']
      )
    }
  },[gda_proxy])

  // whenever the current data changes, this 
  useEffect(() => {
    if (currentData != '') {
      if (!dates.hasOwnProperty(currentData)){
        getCentroids(currentData, gda_proxy)
        getDates(columnNames[currentData], 'cases', currentData)
      }
    } 
  },[columnNames])

  // whenever the current date index changes, this 
  useEffect(() => {
    if (currDateIndex != '') {
      if (binMode == 'dynamic') {
        let nb = gda_proxy.custom_breaks(currentData, "natural_breaks", 8, null, getDataForBins(dataFn, storedData[currentData], 'cases', currDateIndex, 7))
        dispatch(setBins(nb.bins, [-Math.pow(10, 12), ...nb.breaks.slice(1,-1), Math.pow(10, 12)]))
      } else if (!bins.hasOwnProperty('bins')) {
        let nb = gda_proxy.custom_breaks(currentData, "natural_breaks", 8, null, getDataForBins(dataFn, storedData[currentData], 'cases', currDateIndex, 7))
        dispatch(setBins(nb.bins, [-Math.pow(10, 12), ...nb.breaks.slice(1,-1), Math.pow(10, 12)]))
      } else {}
    } 
  },[currDateIndex])

  return (
    <div className="App">
      <header className="App-header" style={{position:'fixed', left: '20px', top:'20px', zIndex:10}}>
        <h1 style={{color:"white"}}>Tech Demo</h1>
        <button onClick={() => dispatch(set3D())}>3D</button>
      </header>
      <Map />
      <DateSlider />
    </div>
  );
}

export default App;
