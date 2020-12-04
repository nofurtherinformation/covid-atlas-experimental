import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import styled from 'styled-components';

import { colLookup } from '../utils';
import Tooltip from './tooltip';
import { fixedScales, colorScales, dataPresets } from '../config';
import { StyledDropDown } from '../styled_components';
import { setVariableParams, setVariableName, setMapParams, setCurrentData, setPanelState, setNotification } from '../actions';

const VariablePanelContainer = styled.div`
  position:fixed;
  left:0;
  top:50px;
  height:auto;
  min-height:calc(100vh - 50px);
  min-width:200px;
  background-color: #2b2b2b;
  box-shadow: 2px 0px 5px rgba(0,0,0,0.7);
  padding:20px;
  box-sizing: border-box;
  transition:250ms all;
  font: 'Lato', sans-serif;
  color:white;
  z-index:50;
  p.note {
    position: absolute;
    bottom:100px;
    width:calc(100% - 40px);
    font-family: 'Lato', sans-serif;
    font-weight:300;
    font-size:90%;
    a {
      color:#FFCE00;
      text-decoration: none;
    }
  }
  div.poweredByGeoda {
    position: absolute;
    bottom: 40px;
    color:white;
    width:100%;
    text-align:center;
    transform:translateX(-20px);
    a {
      color:white;
      margin:0 auto;
      text-decoration: none;
      letter-spacing: 2px;
      font-size:75%;
      img {
        width:23px;
        height:27px;
        transform: translate(-50%,40%);
      }
    }
  }
  button#showHideLeft {
    position:absolute;
    left:95%;
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
      transform:rotate(0deg);
      transition:500ms all;
    }
    :after {
      opacity:0;
      font-weight:bold;
      content: 'Variables';
      color:white;
      position: relative;
      right:-50px;
      top:-30px;
      transition:500ms all;
      z-index:4;
    }
  }
  button#showHideLeft.hidden {
    left:100%;
    svg {
      transform:rotate(180deg);
    }
    :after {
      opacity:1;
    }
  }
`
const StyledButtonGroup = styled(ButtonGroup)`
  color:white;
  padding-bottom:20px;
  .MuiButtonGroup-grouped {
    color:white;
    border-color:#ffffff77;
    &:hover {
      border-color:white;
    }
    &.active {
      background:white;
      color:#2e2e2e;
    }
  }
`

const TwoUp = styled.div`
  width:100%;
  .MuiFormControl-root {
    width:45%;
    min-width:60px;
    margin-right:5px;
  }
`

const ControlsContainer = styled.div`
  
`

const ListSubheader = styled(MenuItem)`
  font-variant: small-caps;
  font-weight:800;
`

const VariablePanel = (props) => {
  const dispatch = useDispatch();    
  const columnNames = useSelector(state => state.cols);
  const currentData = useSelector(state => state.currentData);
  const currentVariable = useSelector(state => state.currentVariable);
  const mapParams = useSelector(state => state.mapParams);
  const panelState = useSelector(state => state.panelState);

  const PresetVariables = {
    "HEADER:cases":{},
    "Confirmed Count": {
        numerator: 'cases',
        nType: 'time-series',
        nProperty: null,
        denominator: 'properties',
        dType: 'none',
        dProperty: null,
        dRange:null,
        dIndex:null,
        scale:1
    },
    "Confirmed Count per 100K Population": {
        numerator: 'cases',
        nType: 'time-series',
        nProperty: null,
        denominator: 'properties',
        dType: 'characteristic',
        dProperty: 'population',
        dRange:null,
        dIndex:null,
        scale:100000
    },
    "Confirmed Count per Licensed Bed": {
        numerator: 'cases',
        nType: 'time-series',
        nProperty: null,
        denominator: 'properties',
        dType: 'characteristic',
        dProperty: 'beds',
        dRange:null,
        dIndex:null,
        scale:1
    },
    "HEADER:deaths":{},
    "Death Count":{
      numerator: 'deaths',
      nType: 'time-series',
      nProperty: null,
      denominator: 'properties',
      dType: 'none',
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1
        
    }, 
    "Death Count per 100K Population":{
      numerator: 'deaths',
      nType: 'time-series',
      nProperty: null,
      denominator: 'properties',
      dType: 'characteristic',
      dProperty: 'population',
      dRange:null,
      dIndex:null,
      scale:100000

    },
    "Death Count / Confirmed Count":{
      numerator: 'deaths',
      nType: 'time-series',
      nProperty: null,
      denominator: 'cases',
      dType: 'time-series',
      dProperty: null,
      scale:1

    },
    "HEADER:community health":{},
    "Uninsured % (Community Health Factor)":{
      numerator: 'chr_health_factors',
      nType: 'characteristic',
      nProperty: colLookup(columnNames, currentData, 'chr_health_factors', 'UnInPrc'),
      nRange: null,
      denominator: 'properties',
      dType: 'none',
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      colorScale: 'uninsured'

    },
    "Over 65 Years % (Community Health Context)":{
      numerator: 'chr_health_context',
      nType: 'characteristic',
      nProperty: colLookup(columnNames, currentData, 'chr_health_context', 'Over65YearsPrc'),
      nRange: null,
      denominator: 'properties',
      dType: 'none',
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      colorScale: 'over65'
    },
    "Life expectancy (Length and Quality of Life)":{
      numerator: 'chr_life',
      nType: 'characteristic',
      nProperty: colLookup(columnNames, currentData, 'chr_life', 'LfExpRt'),
      nRange: null,
      denominator: 'properties',
      dType: 'none',
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      colorScale: 'lifeExp'
    }
  }

  const CountyVariables = {
    "HEADER:forecasting":{},
    "Forecasting (5-Day Severity Index)": {
      numerator: 'predictions',
      nType: 'characteristic',
      nProperty: colLookup(columnNames, currentData, 'predictions', 'severity_index'),
      nRange: null,
      denominator: 'properties',
      dType: 'none',
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      colorScale: 'forecasting',
      fixedScale: 'forecasting',
    }
  }

  const StateVariables = {
    "HEADER:testing":{},
    "7 Day Testing Positivity Rate %": {
      numerator: 'testing_wk_pos',
      nType: 'time-series',
      nProperty: null,
      nRange: null,
      denominator: 'properties',
      dType: 'none',
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      fixedScale: 'testing',
      colorScale: 'testing'
    },
    "7 Day Testing Capacity": {
      numerator: 'testing_tcap',
      nType: 'time-series',
      nProperty: null,
      nRange: null,
      denominator: 'properties',
      dType: 'none',
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      fixedScale: 'testingCap',
      colorScale: 'testingCap'
    }, 
    "7 Day Confirmed Cases per Testing %":{
      numerator: 'testing_ccpt',
      nType: 'time-series',
      nProperty: null,
      nRange: null,
      denominator: 'properties',
      dType: 'none',
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      fixedScale: 'testing',
      colorScale: 'testing'
    }
  }

  const resetVariable = () => {
    dispatch(setMapParams({customScale: '', fixedScale: null}))
    dispatch(setVariableParams({...PresetVariables["Confirmed Count per 100K Population"]}))
    dispatch(setVariableName("Confirmed Count per 100K Population"))
  }

  const handleVariable = (event) => {
    let variable = event.target.value;
    dispatch(setVariableName(variable))

    let tempParams = PresetVariables[variable] || CountyVariables[variable] || StateVariables[variable] || null;
      
    dispatch(setMapParams({customScale: tempParams.colorScale || '', fixedScale: tempParams.fixedScale || null}))
    dispatch(setVariableParams({...tempParams}))
  };

  const handleDataSource = (event) => {
    let newDataSet = event.target.value
    if ((newDataSet.includes("state") && CountyVariables.hasOwnProperty(currentVariable))||(newDataSet.includes("county") && StateVariables.hasOwnProperty(currentVariable))) {
      resetVariable()
      dispatch(setNotification(`${dataPresets[newDataSet].plainName} data do not have ${currentVariable}. The Atlas will default to Confirmed Cases Per 100k People.`))
      
      setTimeout(() => {dispatch(setCurrentData(newDataSet))}, 250);
      setTimeout(() => {dispatch(setNotification(null))},10000);
    } else {
      dispatch(setCurrentData(newDataSet)); 
    }
  };

  const handleMapType = (event, newValue) => {
    let nBins = newValue === 'hinge15_breaks' ? 6 : 8
    if (newValue === 'lisa') {
      dispatch(
        setMapParams(
          {
            mapType: newValue,
            nBins: 4,
            bins: fixedScales[newValue],
            colorScale: colorScales[newValue]
          }
        )
      )
    } else {
      dispatch(
        setMapParams(
          {
            nBins,
            mapType: newValue
          }
        )
      )
    }
  }

  const handleMapOverlay = (event) =>{
    dispatch(
      setMapParams(
        {
          overlay: event.target.value
        }
      )
    )
  }

  const handleMapResource = (event) =>{
    dispatch(
      setMapParams(
        {
          resource: event.target.value
        }
      )
    )
  }

  const handleOpenClose = () => {
    if (panelState.variables) {
      dispatch(setPanelState({variables:false}))
    } else {
      dispatch(setPanelState({variables:true}))
    }
  }

  const handleVizTypeButton = (vizType) => {
    if (mapParams.vizType !== vizType) {
      dispatch(setMapParams({vizType}))
    }
  }

  return (
    <VariablePanelContainer style={{transform: (panelState.variables ? '' : 'translateX(-100%)')}}>
      <ControlsContainer>
        <h2>Data Sources &amp;<br/> Map Variables</h2>
        <StyledDropDown>
          <InputLabel htmlFor="data-select">Data Source</InputLabel>
          <Select  
            id="data-select"
            value={currentData}
            onChange={handleDataSource}
          >
            
          <ListSubheader disabled>county data</ListSubheader>
            <MenuItem value={'county_usfacts.geojson'} key={'county_usfacts.geojson'}>USA Facts (County)</MenuItem>
            <MenuItem value={'county_nyt.geojson'} key={'county_nyt.geojson'}>New York Times (County)</MenuItem>
            <MenuItem value={'county_1p3a.geojson'} key={'county_1p3a.geojson'}>1point3acres (County)</MenuItem>
          <ListSubheader disabled>state data</ListSubheader>
            <MenuItem value={'state_usafacts.geojson'} key={'state_usafacts.geojson'}>USA Facts (State)</MenuItem>
            <MenuItem value={'state_nyt.geojson'} key={'state_nyt.geojson'} disabled>New York Times (State)</MenuItem>
          </Select>
        </StyledDropDown>
        <br />
        <StyledDropDown>
          <InputLabel htmlFor="numerator-select">Select Variable</InputLabel>
          <Select 
            value={currentVariable} 
            id="numerator-select"
            onChange={handleVariable}
          >
            {
              Object.keys(PresetVariables).map((variable) => {
                if (variable.split(':')[0]==="HEADER") {
                  return <ListSubheader key={variable.split(':')[1]} disabled>{variable.split(':')[1]}</ListSubheader>
                } else {
                  return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
                }
              })
            }
            
            {
              currentData.includes("county") && Object.keys(CountyVariables).map((variable) => {
                if (variable.split(':')[0]==="HEADER") {
                  return <ListSubheader key={variable.split(':')[1]} disabled>{variable.split(':')[1]}</ListSubheader>
                } else {
                  return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
                }
              })
            }
            
            {
              currentData.includes("state") && Object.keys(StateVariables).map((variable) => {
                if (variable.split(':')[0]==="HEADER") {
                  return <ListSubheader key={variable.split(':')[1]} disabled>{variable.split(':')[1]}</ListSubheader>
                } else {
                  return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
                }
              })
            }
          </Select>
        </StyledDropDown>
        <br/>
        <StyledDropDown component="Radio" >
          <FormLabel component="legend">Map Type</FormLabel>
          <RadioGroup 
            aria-label="maptype" 
            name="maptype1" 
            onChange={handleMapType} 
            value={mapParams.mapType}
            className="radioContainer"
            >
            <FormControlLabel 
              value="natural_breaks" 
              key="natural_breaks" 
              control={<Radio />} 
              label="Natural Breaks"
            /><Tooltip id="NaturalBreaks"/>
            <br/>
            <FormControlLabel 
              value="hinge15_breaks" 
              key="hinge15_breaks" 
              control={<Radio />} 
              label="Box Map" 
            /><Tooltip id="BoxMap"/>
            <br/>
            <FormControlLabel 
              value="lisa" 
              key="lisa" 
              control={<Radio />} 
              label="Hotspot" 
            /><Tooltip id="Hotspot"/>
            <br/>
          </RadioGroup>
        </StyledDropDown>
        <p>Visualization Type</p>
        <StyledButtonGroup color="primary" aria-label="text button group">
          <Button className={mapParams.vizType === '2D' ? 'active' : ''} data-val="2D" key="2D-btn" onClick={() => handleVizTypeButton('2D')}>2D</Button>
          <Button className={mapParams.vizType === '3D' ? 'active' : ''} data-val="3D" key="3D-btn" onClick={() => handleVizTypeButton('3D')}>3D</Button>
          <Button className={mapParams.vizType === 'cartogram' ? 'active' : ''} data-val="cartogram" key="cartogram-btn" onClick={() => handleVizTypeButton('cartogram')}>Cartogram</Button>
        </StyledButtonGroup>
        <br/>
        <TwoUp>
          <StyledDropDown>
            <InputLabel htmlFor="overlay-select">Overlay</InputLabel>
            <Select  
              id="overlay-select"
              value={mapParams.overlay}
              onChange={handleMapOverlay}
            >
              <MenuItem value="" key={'None'}>None</MenuItem> 
              <MenuItem value={'native_american_reservations'} key={'native_american_reservations'}>Native American Reservations</MenuItem>
              <MenuItem value={'segregated_cities'} key={'segregated_cities'}>Hypersegregated Cities<Tooltip id="Hypersegregated"/></MenuItem>
              <MenuItem value={'blackbelt'} key={'blackbelt'}>Black Belt Counties<Tooltip id="BlackBelt" /></MenuItem>
              <MenuItem value={'uscongressional_districts'} key={'uscongressional_districts'}>US Congressional Districts <Tooltip id="USCongress" /></MenuItem>
            </Select>
          </StyledDropDown>
          <StyledDropDown>
            <InputLabel htmlFor="resource-select">Resource</InputLabel>
            <Select  
              id="resource-select"
              value={mapParams.resource}
              onChange={handleMapResource}
            >
              <MenuItem value="" key='None'>None</MenuItem> 
              <MenuItem value={'clinics_hospitals'} key={'variable1'}>Clinics and Hospitals</MenuItem>
              <MenuItem value={'clinics'} key={'variable2'}>Clinics</MenuItem>
              <MenuItem value={'hospitals'} key={'variable3'}>Hospitals</MenuItem>
            </Select>
          </StyledDropDown>
        </TwoUp>
      </ControlsContainer>
      <p className="note">
        Data is updated with freshest available data at 3pm CST daily, at minimum. 
        In case of data discrepancy, local health departments are considered most accurate as per CDC recommendations. 
        More information on <a href="data.html">data</a>, <a href="methods.html">methods</a>, 
        and <a href="FAQ.html">FAQ</a> at main site.
      </p>
      <div className="poweredByGeoda">
            <a href="https://geodacenter.github.io" target="_blank" rel="noopener noreferrer">
              <img src={`${process.env.PUBLIC_URL}/assets/img/geoda-logo.png`} />
              POWERED BY GEODA
            </a>
        </div>
      <button onClick={handleOpenClose} id="showHideLeft" className={panelState.variables ? 'active' : 'hidden'}>
        <svg version="1.1" x="0px" y="0px" viewBox="0 0 100 100">
          <g transform="translate(50 50) scale(0.69 0.69) rotate(0) translate(-50 -50)">
            <path d="M38,33.8L23.9,47.9c-1.2,1.2-1.2,3.1,0,4.2L38,66.2l4.2-4.2l-9-9H71v17c0,0.6-0.4,1-1,1H59v6h11
              c3.9,0,7-3.1,7-7V30c0-3.9-3.1-7-7-7H59v6h11c0.6,0,1,0.4,1,1v17H33.2l9-9L38,33.8z"/>
          </g>
        </svg>

      </button>

    </VariablePanelContainer>
  );
}

export default VariablePanel;