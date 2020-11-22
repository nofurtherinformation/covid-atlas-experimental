import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setVariableParams, setVariableName, setMapParams } from '../actions';
import { makeStyles } from '@material-ui/core/styles';
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

const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 200,
      color:'white',
      padding:0,
      margin: '0 10px 40px 0',
      fontFamily: "'Lato', sans-serif",
      '& > .MuiFormLabel-root': {
        color:'white',
      },
      '& > .MuiInput-underline:before': {
        borderBottom:'1px solid rgba(255,255, 255, 0.42)'
      },
      '& > .MuiInput-underline:after': {
        borderBottom: '2px solid white'
      },
      '& > .MuiInputBase-root': {
        color: 'white',
        '& > .MuiSvgIcon-root': {
          color: 'rgba(255,255,255,0.54)'
        },
        '& > .MuiPopover-paper': {
          color:'white',
          background:'black'
        }
      },
      '& > .MuiFormGroup-root':{
        '& > .MuiFormControlLabel-root': {
          color:'white',
          '& > .MuiRadio-root': {
            color: 'rgba(255,255,255,0.54)'
          },
        }
      }
    },
    twoUp: {
      width:'100%',
      '& > .MuiFormControl-root': {
        width:'45%',
        // display: 'inline',
        minWidth:60
      }
    }
}));

const VariablePanelContainer = styled.div`
  position:fixed;
  left:0;
  top:0;
  height:100vh;
  max-width:20vw;
  background-color: #2b2b2b;
  box-shadow: 2px 0px 5px rgba(0,0,0,0.7);
  padding:20px;
  box-sizing: border-box;
  transition:250ms all;
  font: 'Lato', sans-serif;
  color:white;
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

const VariablePanel = (props) => {

  const classes = useStyles();

  const dispatch = useDispatch();  
  
  const columnNames = useSelector(state => state.cols);
  const currentData = useSelector(state => state.currentData);
  const currentVariable = useSelector(state => state.currentVariable);
  const mapParams = useSelector(state => state.mapParams);

  const [hidePanel, setHidePanel] = useState(false);
  
  const PresetVariables = {
      "Confirmed Count": {
          numerator: 'cases',
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
        dIndex:null,
        scale:1,

      },
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
      // setCurrVariableName(variable);
      dispatch(setVariableName(variable))

      if (PresetVariables.hasOwnProperty(variable)) {
          dispatch(setVariableParams({...PresetVariables[variable]}))
      } else if (CountyVariables.hasOwnProperty(variable)){
          dispatch(setVariableParams({...CountyVariables[variable]}))
      } else {
          dispatch(setVariableParams({...StateVariables[variable]}))
      }
          
  };

  const handleMapType = (event, newValue) =>{
    console.log(newValue)
      dispatch(
        setMapParams(
          {
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
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="data-select">Data Source</InputLabel>
        <Select  
          id="data-select"
        >
          
        <ListSubheader>County Data</ListSubheader>
          <MenuItem value={'variable1'} key={'variable1'}>USA Facts</MenuItem>
          <MenuItem value={'variable2'} key={'variable2'}>1point3acres</MenuItem>
          <MenuItem value={'variable3'} key={'variable3'}>New York Times</MenuItem>
        <ListSubheader>State Data</ListSubheader>
          <MenuItem value={'variable4'} key={'variable4'}>1point3acres</MenuItem>
          <MenuItem value={'variable5'} key={'variable5'}>New York Times</MenuItem>
        </Select>
      </FormControl>
      <br />
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="numerator-select">Select Variable</InputLabel>
        <Select 
          value={currentVariable} 
          id="numerator-select"
          onChange={handleVariable}
        >
          {
            Object.keys(PresetVariables).map((variable) => <MenuItem value={variable} key={variable}>{variable}</MenuItem> )
          }
          
          {
            currentData.includes("county") && Object.keys(CountyVariables).map((variable) => <MenuItem value={variable} key={variable}>{variable}</MenuItem> )
          }
          
          {
            currentData.includes("state") && Object.keys(StateVariables).map((variable) => <MenuItem value={variable} key={variable}>{variable}</MenuItem> )
          }
        </Select>
      </FormControl>
      <br/>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Map Type</FormLabel>
        <RadioGroup 
          aria-label="maptype" 
          name="maptype1" 
          onChange={handleMapType} 
          value={mapParams.mapType}
          >
          <FormControlLabel value="choropleth" control={<Radio />} label="Choropleth" />
          <FormControlLabel value="hinge15" control={<Radio />} label="Box Map" />
          <FormControlLabel value="lisa" control={<Radio />} label="Local Moran" />
          <FormControlLabel value="cartogram" control={<Radio />} label="Cartogram" />
        </RadioGroup>
      </FormControl>
      <div className={classes.twoUp}>
        <FormControl className={classes.formControl}>
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
        </FormControl>
        <FormControl className={classes.formControl}>
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
        </FormControl>
      </div>
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