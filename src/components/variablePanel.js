import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setVariableParams, setVariableName, setMapParams, setCurrentData } from '../actions';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { colLookup } from '../utils';
import styled from 'styled-components';

const VariablePanelContainer = styled.div`
  position:fixed;
  left:0;
  top:0;
  height:100vh;
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
      color:yellow;
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


const StyledDropDown = styled(FormControl)`
  padding:0 0 40px 0!important;
  color:white;
  padding:0;
  margin: 0 10px 40px 0;
  .MuiInputBase-root {
    font-family: 'Lato', sans-serif;
  }
  .MuiFormLabel-root {
    color: white;
    font-family: 'Lato', sans-serif;
  }
  .Mui-focused {
    color: white !important;
  }
  .MuiInput-underline:before {
    border-bottom:1px solid rgba(255,255, 255, 0.42);
  }
  .MuiInput-underline:after {
    border-bottom: 2px solid white
  }
  .MuiInputBase-root {
    color: white;
    .MuiSvgIcon-root {
      color: rgba(255,255,255,0.54);
    },
    .MuiPopover-paper {
      color:white;
    }
  }
  .MuiFormGroup-root {
    .MuiFormControlLabel-root{
      color:white;
      span {
        font-family: 'Lato', sans-serif;
      }
      .MuiRadio-root {
        color: rgba(255,255,255,0.54);
      }
    }
  }
  .MuiRadio-root {
    color:white;
  }
  .MuiRadio-colorSecondary.Mui-checked {
    color:white;
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
const VariablePanel = (props) => {

  const dispatch = useDispatch();  
  
  const columnNames = useSelector(state => state.cols);
  const currentData = useSelector(state => state.currentData);
  const currentVariable = useSelector(state => state.currentVariable);
  const mapParams = useSelector(state => state.mapParams);

  const [hidePanel, setHidePanel] = useState(false);
  
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
          scale:1,
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
          scale:100000,
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
          scale:1,
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
        scale:1,
          
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
        scale:100000,

      },
      "Death Count / Confirmed Count":{
        numerator: 'deaths',
        nType: 'time-series',
        nProperty: null,
        denominator: 'cases',
        dType: 'time-series',
        dProperty: null,
        scale:1,

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
      }
  }

  

  const handleVariable = (event) => {
      let variable = event.target.value;
      dispatch(setVariableName(variable))

      if (PresetVariables.hasOwnProperty(variable)) {
          dispatch(setVariableParams({...PresetVariables[variable]}))
      } else if (CountyVariables.hasOwnProperty(variable)){
          dispatch(setVariableParams({...CountyVariables[variable]}))
      } else {
          dispatch(setVariableParams({...StateVariables[variable]}))
      }
          
  };

  const handleDataSource = (event) => {
    dispatch(setCurrentData(event.target.value)) ;  
  };

  const handleMapType = (event, newValue) =>{
    let nBins = newValue === 'hinge15_breaks' ? 6 : 8
    dispatch(
      setMapParams(
        {
          nBins,
          'mapType': newValue
        }
      )
    )
  }

  const handleMapOverlay = (event) =>{
    dispatch(
      setMapParams(
        {
          'overlay': event.target.value
        }
      )
    )
  }

  const handleMapResource = (event) =>{
    dispatch(
      setMapParams(
        {
          'resource': event.target.value
        }
      )
    )
  }

  return (
    <VariablePanelContainer style={{transform: (hidePanel ? 'translateX(-100%)' : '')}}>
      <h2>Data Sources &amp;<br/> Map Variables</h2>
      <StyledDropDown>
        <InputLabel htmlFor="data-select">Data Source</InputLabel>
        <Select  
          id="data-select"
          value={currentData}
          onChange={handleDataSource}
        >
          
        <ListSubheader>county data</ListSubheader>
          <MenuItem value={'county_usfacts.geojson'} key={'county_usfacts.geojson'}>USA Facts</MenuItem>
          <MenuItem value={'county_nyt.geojson'} key={'county_nyt.geojson'}>New York Times</MenuItem>
          <MenuItem value={'county_1p3a.geojson'} key={'county_1p3a.geojson'}>1point3acres</MenuItem>
        <ListSubheader>state data</ListSubheader>
          <MenuItem value={'state_1p3a.geojson'} key={'state_1p3a.geojson'}>1point3acres</MenuItem>
          <MenuItem value={'state_nyt.geojson'} key={'state_nyt.geojson'} disabled>New York Times</MenuItem>
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
                return <ListSubheader>{variable.split(':')[1]}</ListSubheader>
              } else {
                return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
              }
            })
          }
          
          {
            currentData.includes("county") && Object.keys(CountyVariables).map((variable) => {
              if (variable.split(':')[0]==="HEADER") {
                return <ListSubheader>{variable.split(':')[1]}</ListSubheader>
              } else {
                return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
              }
            })
          }
          
          {
            currentData.includes("state") && Object.keys(StateVariables).map((variable) => {
              if (variable.split(':')[0]==="HEADER") {
                return <ListSubheader>{variable.split(':')[1]}</ListSubheader>
              } else {
                return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
              }
            })
          }
        </Select>
      </StyledDropDown>
      <br/>
      <StyledDropDown component="fieldset" >
        <FormLabel component="legend">Map Type</FormLabel>
        <RadioGroup 
          aria-label="maptype" 
          name="maptype1" 
          onChange={handleMapType} 
          value={mapParams.mapType}
          >
          <FormControlLabel value="natural_breaks" control={<Radio />} label="Choropleth" />
          <FormControlLabel value="hinge15_breaks" control={<Radio />} label="Box Map" />
          <FormControlLabel value="lisa" control={<Radio />} label="Local Moran" />
          <FormControlLabel value="cartogram" control={<Radio />} label="Cartogram" />
        </RadioGroup>
      </StyledDropDown>
      <TwoUp>
        <StyledDropDown>
          <InputLabel htmlFor="overlay-select">Overlay</InputLabel>
          <Select  
            id="overlay-select"
            value={mapParams.overlay}
            onChange={handleMapOverlay}
          >
            <MenuItem value="" key={'None'}>None</MenuItem> 
            <MenuItem value={'native_american_reservations'} key={'variable1'}>Native American Reservations</MenuItem>
            <MenuItem value={'hypersegregated_cities'} key={'variable2'}>Hypersegregated Cities</MenuItem>
            <MenuItem value={'black_belt_counties'} key={'variable3'}>Black Belt Counties</MenuItem>
            <MenuItem value={'us_congressional_districts'} key={'variable4'}>US Congressional Districts</MenuItem>
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
      <button onClick={() => setHidePanel(prev => { return !prev })} id="showHideLeft" className={hidePanel ? 'hidden' : 'active'}>
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