import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as jsgeoda from 'jsgeoda';

// Helper and Utility functions //
// first row: data loading
// second row: data parsing for specific outputs
// third row: data accessing
import { 
  getParseCSV, mergeData, getColumns, findDates, loadJson,
  getDataForBins, getDataForCharts, getDataForLisa, 
  getLisaValues, getVarId, getCartogramValues } from './utils';

// Actions -- Redux state manipulation following Flux architecture //
// first row: data storage
// second row: data and metadata handling 
// third row: map and variable parameters
import { 
  storeData, storeGeojson, storeLisaValues, storeCartogramData,
  setCentroids, setCurrentData, setChartData, setDates, setColumnNames, setDate, 
  setMapParams, setVariableParams, setStartDateIndex } from './actions';

import { Map, VariablePanel, BottomPanel, DataPanel, Popover, NavBar, Preloader, InfoBox } from './components';
import { colorScales, fixedScales, dataPresets, defaultData } from './config';

// Main function, App. This function does 2 things:
// 1: App manages the majority of the side effects when the state changes.
//    This takes the form of React's UseEffect hook, which listens
//    for changes in the state and then performs the functions in the hook.
//    App listens for different state changes and then calculates the relevant
//    side effects (such as binning calculations and GeoDa functions, column parsing)
//    and then dispatches new data to the store.
// 2: App assembles all of the components together and sends Props down
//    (as of 12/1 only Preloader uses props and is a higher order component)
function App() {

  // These selectors access different pieces of the store. While App mainly
  // dispatches to the store, we need checks to make sure side effects
  // are OK to trigger. Issues arise with missing data, columns, etc.
  const storedData = useSelector(state => state.storedData);
  const storedGeojson = useSelector(state => state.storedGeojson);
  const storedLisaData = useSelector(state => state.storedLisaData);
  const storedCartogramData = useSelector(state => state.storedCartogramData);
  const currentData = useSelector(state => state.currentData);
  const cols = useSelector(state => state.cols);
  const dates = useSelector(state => state.dates);
  const mapParams = useSelector(state => state.mapParams);
  const dataParams = useSelector(state => state.dataParams);
  const startDateIndex = useSelector(state => state.startDateIndex);
  const mapLoaded = useSelector(state => state.mapLoaded);
  
  // gda_proxy is the WebGeoda proxy class. Generally, having a non-serializable
  // data in the state is poor for performance, but the App component state only
  // contains gda_proxy.
  const [gda_proxy, set_gda_proxy] = useState(null);
  const dispatch = useDispatch();  
  
  // // Dispatch helper functions for side effects and data handling
  // Get centroid data for cartogram
  const getCentroids = (geojson, gda_proxy) =>  dispatch(setCentroids(gda_proxy.GetCentroids(geojson), geojson))
  
  // Get dates from table (cases by default) for indexing
  // Time-series data must be indexed by data in chronological order
  //   They must appear in tabular data after join columns or other
  //   metadata (eg. population, bed count)
  const getDates = (dates, data, table, geojson) =>  {
    dispatch(setDates(dates[0], geojson));
    handleCurrentDates(dates[0], dates[1], data[table].length)
  }

  const handleCurrentDates = (dates, startDate, length) => {
    dispatch(setDate(dates[dates.length-1]));
    dispatch(setVariableParams({
      nIndex: length-1,
      binIndex: length-1
    }));
    dispatch(setStartDateIndex(startDate));
  }

  // Main data loader
  // This functions asynchronously accesses the Geojson data and CSVs
  //   then performs a join and loads the data into the store
  async function loadData(params, gda_proxy) {
    // destructure parameters
    const { geojson, csvs, joinCols, tableNames, accumulate } = params

    // promise all data fetching - CSV and Json
    const csvPromises = csvs.map(csv => getParseCSV(`${process.env.PUBLIC_URL}/csv/${csv}.csv`, joinCols[1], accumulate.includes(csv)).then(result => {return result}))
    Promise.all([
      loadJson(`${process.env.PUBLIC_URL}/geojson/${geojson}`, gda_proxy).then(result => {return result}),
      ...csvPromises
    ]).then(values => {
      // store geojson lookup table
      dispatch(storeGeojson(values[0]['geoidIndex'], geojson));
      // merge data and get results
      let tempData = mergeData(values[0]['data'], joinCols[0], values.slice(1,), tableNames, joinCols[1]);
      let ColNames = getColumns(values.slice(1,), tableNames);
      // store data, data name, and column names
      dispatch(storeData(tempData, geojson));
      dispatch(setCurrentData(geojson));
      dispatch(setColumnNames(ColNames, geojson));
      return { ColNames, tempData };
    }).then( data => {
      const { ColNames, tempData } = data;
      let tempDates = findDates(ColNames.cases);
      // set centroids and dates
      getCentroids(geojson, gda_proxy);
      getDates(tempDates, ColNames, 'cases', geojson);

      // calculate breaks
      let nb = gda_proxy.custom_breaks(
        geojson, 
        mapParams.mapType,
        mapParams.nBins,
        null, 
        getDataForBins(
          tempData, 
          dataParams
        ) 
      ) 
      // while calculating breaks, store chart data
      dispatch(setChartData(getDataForCharts(tempData,'cases',tempDates[1],tempDates)))
      // return breaks
      return nb;
    }).then(nb => {
      // dispatch breaks
      dispatch(
        setMapParams({
          bins: {
            bins: mapParams.mapType === "natural_breaks" ? nb.bins : ['Lower Outlier','< 25%','25-50%','50-75%','>75%','Upper Outlier'],
            breaks: [-Math.pow(10, 12), ...nb.breaks.slice(1,-1), Math.pow(10, 12)]
          },
          colorScale: colorScales[mapParams.customScale || mapParams.mapType]
        })
      )

    })
  }

  const updateBins = () => {
    if (gda_proxy !== null && storedData.hasOwnProperty(currentData) && mapParams.mapType !== "lisa" && mapParams.binMode !== 'dynamic'){
      if (mapParams.fixedScale !== null) {
        dispatch(
          setMapParams({
            bins: fixedScales[mapParams.fixedScale],
            colorScale: colorScales[mapParams.fixedScale]
          })
        )
      } else {
        console.log('Parameter Change: Getting Bins.')
        let nb = gda_proxy.custom_breaks(
          currentData, 
          mapParams.mapType, 
          mapParams.nBins, 
          null, 
          getDataForBins( storedData[currentData], {...dataParams, nIndex: null} )
        )
        
        dispatch(
          setMapParams({
            bins: {
              bins: mapParams.mapType === "natural_breaks" ? nb.bins : ['Lower Outlier','< 25%','25-50%','50-75%','>75%','Upper Outlier'],
              breaks: [-Math.pow(10, 12), ...nb.breaks.slice(1,-1), Math.pow(10, 12)]
            },
            colorScale: colorScales[mapParams.customScale || mapParams.mapType]
          })
        )
      }
    }
  }
  // After runtime is initialized, this loads in gda_proxy to the state
  // TODO: Recompile WebGeoda and load it into a worker
  useEffect(() => {
    const newGeoda = async () => {
      let geoda = await jsgeoda.New();
      set_gda_proxy(geoda);
    }

    newGeoda()
  },[])

  
  // On initial load and after gda_proxy has been initialized, this loads in the default data sets (USA Facts)
  // Otherwise, this side-effect loads the selected data.
  // Each conditions checks to make sure gda_proxy is working.
  useEffect(() => {
    if (gda_proxy === null) {
      return;
    } else if (currentData === '') {
      loadData(
        dataPresets[defaultData],
        gda_proxy
      )
    } else if (storedData[currentData] === undefined) {
      loadData(
        dataPresets[currentData],
        gda_proxy
      )
    } else if (cols[currentData] !== undefined) {
      let dateIndex = findDates(cols[currentData].cases)[1];
      handleCurrentDates(dates[currentData], dateIndex, cols[currentData].cases.length);
      dispatch(setChartData(getDataForCharts(storedData[currentData],'cases',dateIndex,dates[currentData])))
      updateBins();
    }
  },[gda_proxy, currentData])

  // This listens for gda_proxy events for LISA and Cartogram calculations
  // Both of these are computationally heavy.
  useEffect(() => {
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
                dataParams,
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
              getDataForLisa( storedData[currentData], dataParams, storedGeojson[currentData].indexOrder )
            ),
            tempId
          )
        )
      }
    }
  }, [dataParams, mapParams])

  // Trigger on parameter change for metric values
  // Gets bins and sets map parameters
  useEffect(() => {
    updateBins();
  }, [currentData, dataParams.numerator, dataParams.nProperty, dataParams.nRange, dataParams.denominator, dataParams.dProperty, dataParams.dRange, dataParams.scale, mapParams.mapType])

  // trigger on date (index) change for dynamic binning
  useEffect(() => {
    if (gda_proxy !== null && mapParams.binMode === 'dynamic' && currentData !== '' && mapParams.mapType !== 'lisa'){
      let nb = gda_proxy.custom_breaks(
        currentData, 
        mapParams.mapType,
        mapParams.nBins,
        null, 
        getDataForBins( storedData[currentData], dataParams ), 
      );
      dispatch(
        setMapParams({
          bins: {
            bins: mapParams.mapType === "natural_breaks" ? nb.bins : ['Lower Outlier','< 25%','25-50%','50-75%','>75%','Upper Outlier'],
            breaks: [-Math.pow(10, 12), ...nb.breaks.slice(1,-1), Math.pow(10, 12)]
          },
          colorScale: colorScales[mapParams.customScale || mapParams.mapType]
        })
      )
      dispatch(
        setVariableParams({
          binIndex: dataParams.nIndex, 
        })
      )
    }

  }, [dataParams.nIndex, dataParams.dIndex, mapParams.binMode])

  
  return (
    <div className="App">
      <Preloader loaded={mapLoaded} />
      <NavBar />
      <header className="App-header" style={{position:'fixed', left: '20vw', top:'100px', zIndex:10}}>
        <button onClick={() => updateBins()}>Hi</button>
      </header>
      <div id="mainContainer">
        <Map />
        <VariablePanel />
        <DataPanel />
        <BottomPanel />
        <InfoBox />
        <Popover />
      </div>
    </div>
  );
}

export default App;