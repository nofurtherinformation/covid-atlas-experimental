import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setVariableParams } from '../actions';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
}));

const VariablePanel = (props) => {

    const classes = useStyles();

    const dispatch = useDispatch();  
    const [hidePanel, setHidePanel] = useState(false)
    
    const PresetVariables = {
        "Confirmed Count": {
            numerator: 'cases',
            nProperty: null,
            nRange: null,
            denominator: 'properties',
            dProperty: null,
            dRange:null,
            dIndex:null,
            scale:1,
        },
        "Confirmed Count per 100K Population": {
            numerator: 'cases',
            nProperty: null,
            nRange: null,
            denominator: 'properties',
            dProperty: 'population',
            dRange:null,
            dIndex:null,
            scale:100000,
        },
        "Confirmed Count per Licensed Bed": {
            numerator: 'cases',
            nProperty: null,
            nRange: null,
            denominator: 'properties',
            dProperty: 'beds',
            dRange:null,
            dIndex:null,
            scale:1,
        },
        "Death Count":{
            
        }, 
        "Death Count per 100K Population":{

        },
        "Death Count / Confirmed Count":{

        },
        "Uninsured % (Community Health Factor)":{

        },
        "Over 65 Years % (Community Health Context)":{

        },
        "Life expectancy (Length and Quality of Life)":{

        }
    }

    const CountyVariables = {
        "Forecasting (5-Day Severity Index)": {

        }
    }

    const StateVariables = {
        "7 Day Testing Positivity Rate %": {

        },
        "7 Day Testing Capacity": {

        }, 
        "7 Day Confirmed Cases per Testing %":{

        }
    }

    const handleChange = (event) => {
        let variable = event.target.value
        if (PresetVariables.hasOwnProperty(variable)) {
            dispatch(setVariableParams({...PresetVariables[event.target.value]}))
        } else if (CountyVariables.hasOwnProperty(variable)){
            dispatch(setVariableParams({...CountyVariables[event.target.value]}))
        } else {
            dispatch(setVariableParams({...StateVariables[event.target.value]}))
        }
           
    };

    return (
      <div id="variable-panel" style={{transform: (hidePanel ? 'translateX(-100%)' : '')}}>
        <p>Variable</p>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="numerator-select">Numerator</InputLabel>
          <Select 
            defaultValue="" 
            id="numerator-select"
            onChange={handleNumeratorChange}
        >
            {/* <MenuItem value="">
              <em>None</em>
            </MenuItem> */}
            {
                props.columns && menuItems
            }
          </Select>
        </FormControl>
        <hr/>
        
        <p>Normalization</p>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="denominator-select">Denominator</InputLabel>
          <Select 
            defaultValue="" 
            id="denominator-selector"
            onChange={handleDenominatorChange}
            >
                
            {/* <MenuItem value="">
              <em>None</em>
            </MenuItem> */}
            <MenuItem value="">None</MenuItem>
            {
                props.columns && menuItems
            }
          </Select>
        </FormControl>
        <button onClick={() => setHidePanel(prev => { return !prev })} id="showHideLeftPanel">show/hide</button>
      </div>
    );
}

export default VariablePanel;