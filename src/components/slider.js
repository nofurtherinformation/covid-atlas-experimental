import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import { setDate, setVariableParams, incrementDate } from '../actions';
// import { getParseCSV, getJson, mergeData, colIndex, getDataForBins } from './utils';

const useStyles = makeStyles({
    root: {
        width:'100%',
        margin:0,
        padding:'5px 20px',
        color: 'white'
    },
    button: {
        color:'rgb(200,200,200)',
        background: 'none',
        transition: '250ms all',
        borderColor: 'white !important',
        fontSize: '75% !important',
        '& :hover': {
            color:'white'
        },
    },
    buttonActive: {
        cursor: 'initial',
        fontSize: '75%',
        color:'black !important',
        background: 'white !important',
        transition: '250ms all',
        borderColor: 'white'
    },
    slider: {
        color:'white',
        height:'100%',
        '& > span.MuiSlider-rail': {
            display: 'none'
        },
        '& > span.MuiSlider-track': {
            display: 'none'
        },
        '& > span.MuiSlider-thumb': {
            width:'1px',
            height:'100%'
        },
        '& > span.MuiSlider-thumb.MuiSlider-active': {
            boxShadow: '0px 0px 10px rgba(200,200,200,0.5)'
        }
    }
  });

const DateSlider = () => {
    const classes = useStyles();
    const dispatch = useDispatch();  
    
    const currentData = useSelector(state => state.currentData);
    const dates = useSelector(state => state.dates);
    const dataParams = useSelector(state => state.dataParams);
    const startDateIndex = useSelector(state => state.startDateIndex);
    
    const [timerId, setTimerId] = useState(null);
    const [customRange, setCustomRange] = useState(false);
    
    const handleChange = (event, newValue) => {
        if (dataParams.nType === "time-series" && dataParams.dType === "time-series") {
            dispatch(setVariableParams({nIndex: newValue, dIndex: newValue}))
        } else if (dataParams.nType === "time-series") {
            dispatch(setVariableParams({nIndex: newValue}))
        } else if (dataParams.dType === "time-series") {
            dispatch(setVariableParams({dIndex: newValue}))
        } 
        dispatch(setDate(dates[currentData][newValue]));
    };

    const handlePlayPause = (timerId, rate, interval) => {
        if (timerId === null) {
            setTimerId(setInterval(o => dispatch(incrementDate(rate)), interval))
        } else {
            clearInterval(timerId);
            setTimerId(null)
        }
    }

    const handleRangeButton = (val) => {
        if (val === 'custom') { // if swapping over to a custom range, which will use a 2-part slider to scrub the range
            setCustomRange(true)
            if (dataParams.nType === "time-series" && dataParams.dType === "time-series") {
                dispatch(setVariableParams({nRange: 14, dRange: 14}))
            } else if (dataParams.nType === "time-series") {
                dispatch(setVariableParams({nRange: 14}))
            } else if (dataParams.dType === "time-series") {
                dispatch(setVariableParams({dRange: 14}))
            } 
        } else { // use the new value -- null for cumulative, 1 for daily, 7 for weekly
            setCustomRange(false)
            if (dataParams.nType === "time-series" && dataParams.dType === "time-series") {
                dispatch(setVariableParams({nRange: val, dRange: val}))
            } else if (dataParams.nType === "time-series") {
                dispatch(setVariableParams({nRange: val}))
            } else if (dataParams.dType === "time-series") {
                dispatch(setVariableParams({dRange: val}))
            }    
        }
    }

    if (dates[currentData] !== undefined) {
        return (
            <Grid container spacing={2} className={classes.root} id="slider-container" style={{visibility: (dataParams.nType === 'time-series' ? 'visible' : 'hidden')}}>
                <Grid item xs={12}>
                    <h4 style={{textAlign:"center", color:"white"}}>{dates[currentData][dataParams.nIndex]||dates[currentData].slice(-1,)[0]}</h4>
                </Grid>
                <Grid item xs={1}>
                    <button id="playPause" onClick={() => handlePlayPause(timerId, 1, 100)}>
                        {timerId === null ? 'play' : 'pause'}
                    </button>
                </Grid>
                <Grid item xs={9}>
                    <Slider 
                        value={dataParams.nIndex} 
                        onChange={handleChange} 
                        aria-labelledby="continuous-slider"
                        className={classes.slider}
                        min={startDateIndex}
                        step={1}
                        max={dates[currentData].length-1}
                    />
                </Grid>
                <Grid item xs={2}>
                    <ButtonGroup
                        orientation="vertical"
                        color="primary"
                        aria-label="vertical outlined primary button group"
                        style={{float:'right'}}
                    >
                        <Button className={dataParams.nRange === null ? classes.buttonActive : classes.button} onClick={() => handleRangeButton(null)}>Total</Button>
                        <Button className={dataParams.nRange === 1 ?classes.buttonActive : classes.button} onClick={() => handleRangeButton(1)}>New Daily</Button>
                        <Button className={dataParams.nRange === 7 ? classes.buttonActive : classes.button} onClick={() => handleRangeButton(7)}>Weekly Average</Button>
                        <Button className={customRange ? classes.buttonActive : classes.button} onClick={() => handleRangeButton('custom')}>Custom Range</Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        );
    } else {
        return <div className={classes.root} />
    }
}

export default DateSlider