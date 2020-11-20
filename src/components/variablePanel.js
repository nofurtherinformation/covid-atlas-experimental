import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setVariableParams, setVariableName } from '../actions';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { colLookup } from '../utils';

const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
}));

const VariablePanel = (props) => {

  const classes = useStyles();

  const dispatch = useDispatch();  
  
  const columnNames = useSelector(state => state.cols);
  const currentData = useSelector(state => state.currentData);
  const currentVariable = useSelector(state => state.currentVariable);

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

  return (
    <div id="variable-panel" style={{transform: (hidePanel ? 'translateX(-100%)' : '')}}>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="numerator-select">Select Variable</InputLabel>
        <Select 
          defaultValue={currentVariable} 
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
      <hr/>
      <button onClick={() => setHidePanel(prev => { return !prev })} id="showHideLeftPanel" className={hidePanel ? 'hidden' : 'active'}>
        <svg version="1.1" x="0px" y="0px" viewBox="0 0 100 100">
          <g transform="translate(50 50) scale(0.69 0.69) rotate(0) translate(-50 -50)">
            <path d="M38,33.8L23.9,47.9c-1.2,1.2-1.2,3.1,0,4.2L38,66.2l4.2-4.2l-9-9H71v17c0,0.6-0.4,1-1,1H59v6h11
              c3.9,0,7-3.1,7-7V30c0-3.9-3.1-7-7-7H59v6h11c0.6,0,1,0.4,1,1v17H33.2l9-9L38,33.8z"/>
          </g>
        </svg>

      </button>
    </div>
  );
}

export default VariablePanel;