import React, { useEffect, useState } from 'react';
import { setCentroids, storeData, setCurrentData, setDates, setColumnNames, setDate, setDateIndex, setBins, set3D, setVariableParams, setStartDateIndex, setChartData } from './actions';
import { useSelector, useDispatch } from 'react-redux';
import GeodaProxy from './GeodaProxy.js';
import { getParseCSV, getJson, mergeData, colIndex, getDataForBins, getDataForCharts, colLookup } from './utils';
import { Map, DateSlider, Legend, VariablePanel, MainLineChart } from './components';

function App() {
  const storedData = useSelector(state => state.storedData);
  const currentData = useSelector(state => state.currentData);
  const currentVariable = useSelector(state => state.currentVariable);
  const columnNames = useSelector(state => state.cols);
  const dates = useSelector(state => state.dates);
  const bins = useSelector(state => state.bins);
  const binMode = useSelector(state => state.binMode);
  const colorScale = useSelector(state => state.colorScale);
  const dataParams = useSelector(state => state.dataParams);
  const startDateIndex = useSelector(state => state.startDateIndex);

  const [gda_proxy, set_gda_proxy] = useState(null);
  
  const dispatch = useDispatch();  
  
  const getCentroids = (geojson, gda_proxy) =>  dispatch(setCentroids(gda_proxy.GetCentroids(geojson), geojson))
  
  const getDates = (data, table, geojson) =>  {
    let dates = findDates(data[table])
    dispatch(setDates(dates[0], geojson))
    dispatch(setDate(dates[0].slice(-1,)[0]))
    dispatch(setVariableParams({nIndex: colIndex(data, table, dates[0].slice(-1,)[0])}))
    dispatch(setStartDateIndex(dates[1]))
  }

  const findDates = (data) => {
    for (let i = 0; i < data.length; i++) {
      if (Date.parse(data[i])) {
        return [data.slice(i,),i]
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

  async function loadData(geojson, csvs, joinCols, names, gda_proxy) {
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
    const waitForWASM = () => {
      setTimeout(() => {
        console.log(window.Module)
        if (window.Module === undefined) {
          waitForWASM()
        } else {
          if (gda_proxy === null) {
            set_gda_proxy(new GeodaProxy());
          }
        }
      }, 100)
    }

    waitForWASM()
  },[window.Module])

  // on initial load and after gda_proxy has been initialized, this loads in the default data sets (USA Facts)
  useEffect(() => {
    console.log(gda_proxy)
    if ((gda_proxy !== null) && (currentData === '')) {
      loadData(
        'county_usfacts.geojson', 
        ['covid_confirmed_usafacts','covid_deaths_usafacts', 'berkeley_predictions', 'chr_health_context', 'chr_life', 'chr_health_factors'], 
        ['GEOID', 'FIPS'], 
        ['cases','deaths', 'predictions', 'chr_health_context', 'chr_life', 'chr_health_factors'],
        gda_proxy
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

  useEffect(() => {
    if (storedData[currentData]){
      dispatch(
        setChartData(
          getDataForCharts(
            storedData[currentData],
            'cases',
            startDateIndex,
            dates[currentData]
          )
        )
      )
    }
  }, [startDateIndex])



  useEffect(() => {
    if (gda_proxy !== null && currentData !== ''){
      if (binMode === 'dynamic') {
        let nb = gda_proxy.custom_breaks(
          currentData, 
          "natural_breaks", 
          8, 
          null, 
          getDataForBins(
            storedData[currentData], 
            dataParams.numerator, 
            dataParams.nProperty, 
            dataParams.nIndex, 
            dataParams.nRange, 
            dataParams.denominator, 
            dataParams.dProperty, 
            dataParams.dIndex, 
            dataParams.dRange, 
            dataParams.scale
            )
          )
        dispatch(setBins(nb.bins, [-Math.pow(10, 12), ...nb.breaks.slice(1,-1), Math.pow(10, 12)]))
      } else {
        let nb = gda_proxy.custom_breaks(
          currentData, 
          "natural_breaks", 
          8, 
          null, 
          getDataForBins(
            storedData[currentData], 
            dataParams.numerator, 
            dataParams.nType,
            dataParams.nProperty, 
            null,
            dataParams.nRange, 
            dataParams.denominator,
            dataParams.dType,
            dataParams.dProperty, 
            dataParams.dIndex, 
            dataParams.dRange, 
            dataParams.scale
            )
          )
        dispatch(setBins(nb.bins, [-Math.pow(10, 12), ...nb.breaks.slice(1,-1), Math.pow(10, 12)]))
      }
    }
  }, [dates, storedData[currentData], dataParams.numerator, dataParams.nProperty, dataParams.nRange, dataParams.denominator, dataParams.dProperty, dataParams.dRange, dataParams.scale])

  useEffect(() => {
    if (gda_proxy !== null && binMode === 'dynamic' && currentData !== ''){
      let nb = gda_proxy.custom_breaks(
        currentData, 
        "natural_breaks", 
        8, 
        null, 
        getDataForBins(
          storedData[currentData], 
          dataParams.numerator, 
          dataParams.nProperty, 
          dataParams.nIndex, 
          dataParams.nRange, 
          dataParams.denominator, 
          dataParams.dProperty, 
          dataParams.dIndex, 
          dataParams.dRange, 
          dataParams.scale
          )
        )
      dispatch(setBins(nb.bins, [-Math.pow(10, 12), ...nb.breaks.slice(1,-1), Math.pow(10, 12)]))
    }
  }, [dataParams.nIndex, dataParams.dIndex])

  return (
    <div className="App">
      {/* <header className="App-header" style={{position:'fixed', left: '30vw', top:'20px', zIndex:10}}>
        <h1 style={{color:"white"}}>Tech Demo</h1>
        <button onClick={() => console.log(         getDataForCharts(
            storedData[currentData],
            'cases',
            startDateIndex,
            dates[currentData]
          ))}>total count</button>
      </header> */}
      <Map />
      <VariablePanel />
      <div id="bottom-drawer">
        <Legend labels={bins.bins} title={currentVariable} colors={colorScale} />
        <hr />
        <MainLineChart />
        <DateSlider />
      </div>
    </div>
  );
}

export default App;
