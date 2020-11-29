import React, { useEffect, useState } from 'react';
import { setCentroids, storeData, setCurrentData, setDates, setColumnNames, setDate, setDateIndex, setMapParams, setVariableParams, setStartDateIndex, setChartData, storeGeojson, storeLisaValues, storeCartogramData } from './actions';
import { useSelector, useDispatch } from 'react-redux';
import GeodaProxy from './GeodaProxy.js';
import { getParseCSV, getJson, mergeData, colIndex, findDates, getDataForBins, getDataForCharts, dataFn, getLisaValues, getVarId, getGeoids, getDataForLisa, getCartogramValues } from './utils';
import { Map, VariablePanel, BottomPanel, DataPanel, Popover, NavBar, Preloader } from './components';
import { colorScales, fixedScales, dataPresets } from './config';

function App() {
  const storedData = useSelector(state => state.storedData);
  const storedGeojson = useSelector(state => state.storedGeojson);
  const storedLisaData = useSelector(state => state.storedLisaData);
  const storedCartogramData = useSelector(state => state.storedCartogramData);
  const currentData = useSelector(state => state.currentData);
  const columnNames = useSelector(state => state.cols);
  const dates = useSelector(state => state.dates);
  const mapParams = useSelector(state => state.mapParams);
  const dataParams = useSelector(state => state.dataParams);
  const startDateIndex = useSelector(state => state.startDateIndex);
  const mapLoaded = useSelector(state => state.mapLoaded)
  
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

  const getColumns = (data, names) => {
    let rtn = {};
    for (let i=0; i < data.length; i++) {
      rtn[names[i]] = data[i][1]
    }
  return rtn;
  }

  async function loadData(geojson, csvs, joinCols, names, accumulate, gda_proxy) {
    const csvPromises = csvs.map(csv => getParseCSV(`${process.env.PUBLIC_URL}/csv/${csv}.csv`, joinCols[1], accumulate.includes(csv)).then(result => {return result}))
    Promise.all([
      getJson(`${process.env.PUBLIC_URL}/geojson/${geojson}`, gda_proxy),
      ...csvPromises
    ]).then(values => {
      dispatch(storeGeojson(values[0]['geoidIndex'], geojson));
      let tempData = mergeData(values[0]['data'], joinCols[0], values.slice(1,), names, joinCols[1]);
      dispatch(storeData(tempData, geojson));
      dispatch(setCurrentData(geojson));
      dispatch(setColumnNames(getColumns(values.slice(1,), names), geojson));
    })    
  }

  // After runtime is initialized, this loads in gda_proxy to the state
  useEffect(() => {
    const waitForWASM = () => {
      setTimeout(() => {
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
    if ((gda_proxy !== null) && (currentData === '')) {
      loadData(
        'county_usfacts.geojson', 
        ['covid_confirmed_usafacts','covid_deaths_usafacts', 'berkeley_predictions', 'chr_health_context', 'chr_life', 'chr_health_factors'], 
        ['GEOID', 'FIPS'], 
        ['cases','deaths', 'predictions', 'chr_health_context', 'chr_life', 'chr_health_factors'],
        [],
        gda_proxy
      )
    }
  },[gda_proxy])

  useEffect(() => {
    if ((gda_proxy !== null) && (currentData !== '')) {
      if (storedData[currentData] === undefined) {
        loadData(
          dataPresets[currentData].geojson, 
          dataPresets[currentData].csv, 
          dataPresets[currentData].joinCols,
          dataPresets[currentData].tableNames,  
          dataPresets[currentData].accumulate,
          gda_proxy
        )
      }
    }
  },[currentData])


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

  // get lisa values on change, if map type set to lisa
  useEffect(() => {
    console.log('map or data params')
    if (gda_proxy !== null && mapParams.mapType === "lisa"){
      let tempId = getVarId(currentData, dataParams)
      if (!(storedLisaData.hasOwnProperty(tempId))) {
        dispatch(
          storeLisaValues(
            getLisaValues(
              gda_proxy, 
              currentData, 
              getDataForLisa(
                storedData[currentData], 
                dataParams.numerator, 
                dataParams.nType,
                dataParams.nProperty, 
                dataParams.nIndex, 
                dataParams.nRange, 
                dataParams.denominator, 
                dataParams.dType,
                dataParams.dProperty, 
                dataParams.dIndex, 
                dataParams.dRange, 
                dataParams.scale,
                storedGeojson[currentData].indexOrder
              )
            ),
            tempId
          )
        )
      }
    } 
    if (gda_proxy !== null && mapParams.vizType === "cartogram"){
      let tempId = getVarId(currentData, dataParams)
      if (!(storedCartogramData.hasOwnProperty(tempId))) {
        dispatch(
          storeCartogramData(
            getCartogramValues(
              gda_proxy, 
              currentData, 
              getDataForLisa(
                storedData[currentData], 
                dataParams.numerator, 
                dataParams.nType,
                dataParams.nProperty, 
                dataParams.nIndex, 
                dataParams.nRange, 
                dataParams.denominator, 
                dataParams.dType,
                dataParams.dProperty, 
                dataParams.dIndex, 
                dataParams.dRange, 
                dataParams.scale,
                storedGeojson[currentData].indexOrder
              )
            ),
            tempId
          )
        )
      }
    }
  }, [dataParams, mapParams])

  // trigger on parameter change for metric values
  useEffect(() => {
    if (gda_proxy !== null && currentData !== '' && mapParams.mapType !== "lisa"){
      if (mapParams.fixedScale !== null) {
        dispatch(
          setMapParams({
            bins: fixedScales[mapParams.fixedScale],
            colorScale: colorScales[mapParams.fixedScale]
          })
        )
      } else {
        let nb = gda_proxy.custom_breaks(
          currentData, 
          mapParams.mapType, 
          mapParams.nBins, 
          null, 
          getDataForBins(
            storedData[currentData], 
            dataParams.numerator, 
            dataParams.nType,
            dataParams.nProperty, 
            mapParams.binMode === 'dynamic' ? dataParams.nIndex : null,
            dataParams.nRange, 
            dataParams.denominator,
            dataParams.dType,
            dataParams.dProperty, 
            mapParams.binMode === 'dynamic' ? dataParams.dIndex : null, 
            dataParams.dRange, 
            dataParams.scale
          )
        )

        dispatch(
          setMapParams({
            bins: {
              bins: mapParams.mapType === "natural_breaks" ? nb.bins : ['Lower Outlier','< 25%','25-50%','50-75%','>75%','Upper Outlier'],
              breaks: [-Math.pow(10, 12), ...nb.breaks.slice(1,-1), Math.pow(10, 12)]
            },
            colorScale: colorScales[mapParams.mapType]
          })
        )
      }
    }
  }, [dates, dataParams.numerator, dataParams.nProperty, dataParams.nRange, dataParams.denominator, dataParams.dProperty, dataParams.dRange, dataParams.scale, mapParams.mapType])

  // trigger on date (index) change for dynamic binning
  useEffect(() => {
    if (gda_proxy !== null && mapParams.binMode === 'dynamic' && currentData !== '' && mapParams.mapType !== 'lisa'){
      let nb = gda_proxy.custom_breaks(
        currentData, 
        mapParams.mapType,
        mapParams.nBins,
        null, 
        getDataForBins(
          storedData[currentData], 
          dataParams.numerator, 
          dataParams.nType,
          dataParams.nProperty, 
          dataParams.nIndex, 
          dataParams.nRange, 
          dataParams.denominator, 
          dataParams.dType,
          dataParams.dProperty, 
          dataParams.dIndex, 
          dataParams.dRange, 
          dataParams.scale
          ), 
        )
      dispatch(
        setMapParams({
          bins: {
            bins: mapParams.mapType === "natural_breaks" ? nb.bins : ['Lower Outlier','< 25%','25-50%','50-75%','>75%','Upper Outlier'],
            breaks: [-Math.pow(10, 12), ...nb.breaks.slice(1,-1), Math.pow(10, 12)]
          },
          colorScale: colorScales[mapParams.mapType]
        })
      )
    }

  }, [dataParams.nIndex, dataParams.dIndex, mapParams.binMode])

  return (
    <div className="App">
      <Preloader loaded={mapLoaded} />
      <NavBar />
      {/* <header className="App-header" style={{position:'fixed', left: '20vw', top:'20px', zIndex:10}}>
        <button onClick={() => console.log(gda_proxy.custom_breaks(
          currentData, 
          mapParams.mapType, 
          mapParams.nBins, 
          null, 
          getDataForBins(
            storedData[currentData], 
            dataParams.numerator, 
            dataParams.nType,
            dataParams.nProperty, 
            298,
            dataParams.nRange, 
            dataParams.denominator,
            dataParams.dType,
            dataParams.dProperty, 
            298, 
            dataParams.dRange, 
            dataParams.scale
          )
        )


        )}>dummy button for testing</button>
      </header> */}
      <div id="mainContainer">
        <Map />
        <VariablePanel />
        <DataPanel />
        <BottomPanel />
        <Popover />
      </div>
    </div>
  );
}

export default App;