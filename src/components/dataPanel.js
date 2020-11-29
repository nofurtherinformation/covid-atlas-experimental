// This components formats the data for the selected geography
// and displays it in the right side panel.

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import styled from 'styled-components';

import { setPanelState } from '../actions';
import {dataFn, colLookup} from '../utils';

// Styled components CSS
const DataPanelContainer = styled.div`
  position:fixed;
  right:0;
  top:50px;
  height:calc(100vh - 50px);
  min-width:200px;
  background-color: #2b2b2b;
  box-shadow: -2px 0px 5px rgba(0,0,0,0.7);
  padding:20px;
  box-sizing: border-box;
  transition:250ms all;
  font: 'Lato', sans-serif;
  color: white;
  font-size:100%;
  padding:0;
  z-index:5;
  div.container {
    width:100%;
    height:100vh;
    overflow-y:scroll;
    padding:5px 0 0 30px;
    box-sizing:border-box;
    div {
      padding-right:20px;
      box-sizing:border-box;
    }
  }
  button#showHideRight {
    position:absolute;    
    right:95%;
    top:20px;
    width:40px;
    height:40px;
    padding:0;
    margin:0;
    background-color: #2b2b2b;
    box-shadow: 0px 0px 6px rgba(0,0,0,1);
    outline:none;
    border:none;
    cursor: pointer;
    transition:500ms all;
    svg {
      padding:0;
      margin:0;
      fill:white;
      transform:rotate(180deg);
      transition:500ms all;
    }
    :after {
      opacity:0;
      font-weight:bold;
      color:white;
      position: relative;
      top:-30px;
      transition:500ms all;
      content: 'Info';
      right:40px;
      z-index:4;
    }
  }
  button#showHideRight.hidden {
    right:100%;
    svg {
      transform:rotate(0deg);
    }
    :after {
      opacity:1;
    }
  }
`

const DataPanel = () => {

  const dispatch = useDispatch();

  // de-structure sidebarData, which houses selected geography data
  const { properties, cases, deaths, predictions,
    chr_health_factors, chr_life, chr_health_context } = useSelector(state => state.sidebarData);
  // name of current data set
  const currentData = useSelector(state => state.currentData);
  // panels open/close state
  const panelState = useSelector(state => state.panelState);
  //column names
  const cols = useSelector(state => state.cols);

  // helper for predictions data
  const parsePredictedDate = (list) => `${list.slice(-2,)[0]}/${list.slice(-1,)[0]}`

  // handles panel open/close
  const handleOpenClose = () => panelState.info ? dispatch(setPanelState({info:false})) : dispatch(setPanelState({info:true}))
  
  return (
    <DataPanelContainer style={{transform: (panelState.info ? '' : 'translateX(100%)')}} id="data-panel">
      <div className="container">
        {properties && <h2>{properties.NAME}, {properties.state_name}</h2>}
        {properties && 
          <div>
            <p>Population: {properties.population.toLocaleString('en')}</p>
          </div>
        }
        {(cases && deaths) && 
          <div>
            <p>
              Total Cases: {cases.slice(-1,)[0].toLocaleString('en')}<br/>
              Total Deaths: {deaths.slice(-1,)[0].toLocaleString('en')}<br/>
              Cases per 100k Population: {dataFn(cases, null, cases.length-1, null, properties, 'population', null, null, 100000).toFixed(2).toLocaleString('en')}<br/>
              Deaths per 100k Population: {dataFn(deaths, null, deaths.length-1, null, properties, 'population', null, null, 100000).toFixed(2).toLocaleString('en')}<br/>
              New Cases per 100k Population: {dataFn(cases, null, cases.length-1, 1, properties, 'population', null, null, 100000).toFixed(2).toLocaleString('en')}<br/>
              New Deaths per 100k Population: {dataFn(deaths, null, deaths.length-1, 1, properties, 'population', null, null, 100000).toFixed(2).toLocaleString('en')}<br/>
              Licensed Hospital Beds: {properties.beds.toLocaleString('en')}<br/>
              Cases per Bed: {dataFn(cases, null, cases.length-1, null, properties, 'beds', null, null, 1).toFixed(2).toLocaleString('en')}<br/>
            </p>
          </div>
        }
        {chr_health_factors &&
          <div>
            <h2>Community Health Factors</h2>
            <p>
              Children in poverty %: {chr_health_factors[colLookup(cols, currentData, 'chr_health_factors', 'PovChldPrc')]}<br/>
              Income inequality: {chr_health_factors[colLookup(cols, currentData, 'chr_health_factors', 'IncRt')]}<br/>
              Median household income: {chr_health_factors[colLookup(cols, currentData, 'chr_health_factors', 'MedianHouseholdIncome')].toLocaleString('en')}<br/>
              Food insecurity %: {chr_health_factors[colLookup(cols, currentData, 'chr_health_factors', 'FdInsPrc')]}<br/>
              Unemployment %: {chr_health_factors[colLookup(cols, currentData, 'chr_health_factors', 'UnEmplyPrc')]}<br/>
              Uninsured %: {chr_health_factors[colLookup(cols, currentData, 'chr_health_factors', 'UnInPrc')]}<br/>
              Primary care physicians: {chr_health_factors[colLookup(cols, currentData, 'chr_health_factors', 'PrmPhysRt')]}<br/>
              Preventable hospital stays: {chr_health_factors[colLookup(cols, currentData, 'chr_health_factors', 'PrevHospRt')].toLocaleString('en')}<br/>
              Residential segregation-black/white: {chr_health_factors[colLookup(cols, currentData, 'chr_health_factors', 'RsiSgrBlckRt')]}<br/>
              Severe housing problems %: {chr_health_factors[colLookup(cols, currentData, 'chr_health_factors', 'SvrHsngPrbRt')]}<br/>
            </p>
          </div>
        }
        {chr_health_context &&
          <div>
            <h2>Community Health Context</h2>
            <p>
              % 65 and older: {chr_health_context[colLookup(cols, currentData, 'chr_health_context', 'Over65YearsPrc')]} <br/>
              Adult obesity %: {chr_health_context[colLookup(cols, currentData, 'chr_health_context', 'AdObPrc')]} <br/>
              Diabetes prevalence %: {chr_health_context[colLookup(cols, currentData, 'chr_health_context', 'AdDibPrc')]} <br/>
              Adult smoking %: {chr_health_context[colLookup(cols, currentData, 'chr_health_context', 'SmkPrc')]} <br/>
              Excessive drinking %: {chr_health_context[colLookup(cols, currentData, 'chr_health_context', 'ExcDrkPrc')]} <br/>
              Drug overdose deaths: {chr_health_context[colLookup(cols, currentData, 'chr_health_context', 'DrOverdMrtRt')]||'0'} <br/>
            </p>
          </div>
        }
        {chr_life && 
          <div>
            <h2>Length and Quality of Life</h2>
            <p>
              Life expectancy: {chr_life[colLookup(cols, currentData, 'chr_life', 'LfExpRt')]} <br/>
              Self-rated health %: {chr_life[colLookup(cols, currentData, 'chr_life', 'SlfHlthPrc')]} <br/>
            </p>
          </div>
        }
        {predictions && 
          <div>
            <h2>Predictions</h2>
            <p>
              5-Day Severity Index: {['','High','Medium','Low'][predictions[1]]} <br />
              Predicted Deaths by {parsePredictedDate(cols[currentData].predictions[2].split('_'))}: {predictions[2]} <br/>
              Predicted Deaths by {parsePredictedDate(cols[currentData].predictions[4].split('_'))}: {predictions[4]} <br/>
              Predicted Deaths by {parsePredictedDate(cols[currentData].predictions[6].split('_'))}: {predictions[6]} <br/>
              Predicted Deaths by {parsePredictedDate(cols[currentData].predictions[8].split('_'))}: {predictions[8]} <br/>
              Predicted Deaths by {parsePredictedDate(cols[currentData].predictions[10].split('_'))}: {predictions[10]} <br/>
              Predicted Deaths by {parsePredictedDate(cols[currentData].predictions[12].split('_'))}: {predictions[12]} <br/>
              Predicted Deaths by {parsePredictedDate(cols[currentData].predictions[14].split('_'))}: {predictions[14]} <br/>
            </p>
          </div>
        }
        
        {cases && <button onClick={handleOpenClose} id="showHideRight" className={panelState.info ? 'active' : 'hidden'}>
          <svg version="1.1" x="0px" y="0px" viewBox="0 0 100 100">
            <g transform="translate(50 50) scale(0.69 0.69) rotate(0) translate(-50 -50)">
              <path d="M38,33.8L23.9,47.9c-1.2,1.2-1.2,3.1,0,4.2L38,66.2l4.2-4.2l-9-9H71v17c0,0.6-0.4,1-1,1H59v6h11
                c3.9,0,7-3.1,7-7V30c0-3.9-3.1-7-7-7H59v6h11c0.6,0,1,0.4,1,1v17H33.2l9-9L38,33.8z"/>
            </g>
          </svg>

        </button>}
      </div>
    </DataPanelContainer>
  );
}

export default DataPanel;