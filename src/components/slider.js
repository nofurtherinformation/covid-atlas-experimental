import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import styled from 'styled-components';

import { setDate, setVariableParams, incrementDate } from '../actions';
// import { getParseCSV, getJson, mergeData, colIndex, getDataForBins } from './utils';

const SliderContainer = styled(Grid)`
    width: 100%;
    margin: 0;
    padding: 5px 20px;
    color: white;
`

const DateButton = styled(Button)`
    color:rgb(200,200,200);
    background: none;
    transition: 250ms all;
    border-color: white !important;
    font-size: 75% !important;
    transition:250ms all;
    &:hover {
        color:white;
    }
    &.active {
        cursor: initial;
        font-size: 75%;
        color:black !important;
        background: white !important;
        transition: 250ms all;
        border-color: white;
    }
`
const PlayPauseButton = styled(Button)`
    background:none;
    transform:translateY(-100%);
    svg {
        g {
            fill: white;
        }
    }
`

const LineSlider = styled(Slider)`
    color:white;
    // span.MuiSlider-rail {
    //     display:none;
    // }
    // span.MuiSlider-track {
    //     display: none;
    // }
    span.MuiSlider-thumb {
        .MuiSlider-valueLabel {
            transform:translateY(-10px);
            pointer-events:none;
            span {
                background: none;
            }
        }
    }
    span.MuiSlider-thumb.MuiSlider-active: {
        box-shadow: 0px 0px 10px rgba(200,200,200,0.5);
    }
`

const DateSlider = () => {
    const dispatch = useDispatch();  
    
    const currentData = useSelector(state => state.currentData);
    const dates = useSelector(state => state.dates);
    const dataParams = useSelector(state => state.dataParams);
    const startDateIndex = useSelector(state => state.startDateIndex);
    
    const [timerId, setTimerId] = useState(null);
    const [customRange, setCustomRange] = useState(false);
    // const [useLog, setUseLog] = useState(false);
    
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
    function valuetext(value) {
        return `${dates[currentData][value]}`;
    }

    if (dates[currentData] !== undefined) {
        return (
            <SliderContainer container spacing={2} id="slider-container" style={{visibility: (dataParams.nType === 'time-series' ? 'visible' : 'hidden')}}>
                {/* <Grid item xs={12}>
                    <h4 style={{textAlign:"center", color:"white"}}>{dates[currentData][dataParams.nIndex]||dates[currentData].slice(-1,)[0]}</h4>
                </Grid> */}
                <Grid item xs={1}>
                    <PlayPauseButton id="playPause" onClick={() => handlePlayPause(timerId, 1, 100)}>
                        {timerId === null ? 
                            <svg x="0px" y="0px" viewBox="0 0 100 100">
                                <g transform="translate(50 50) scale(0.69 0.69) rotate(0) translate(-50 -50)">
                                    <g>
                                        <path d="M74.4,58.7L40.7,92.2c-7.1,7.2-18.7,4.4-18.7-6.3V14c0-10.7,11.6-13.5,18.7-6.3l33.6,33.5
                                            C79.1,46,79.1,53.8,74.4,58.7z M69.1,53.4c1.9-1.9,1.9-5,0-6.7L35.5,13c-2.1-2.1-6-3.2-6,1.1V86c0,4.3,3.9,3.2,6,1.1L69.1,53.4z"
                                            />
                                    </g>
                                </g>
                            </svg>
                            : 
                            <svg x="0px" y="0px" viewBox="0 0 100 100">
                                <g transform="translate(50 50) scale(0.69 0.69) rotate(0) translate(-50 -50)">
                                    <g>
                                        <path d="M22.4,0.6c3.4,0,6.8,0,10.3,0c6.5,0,11.8,5.3,11.8,11.8c0,25,0,50.1,0,75.2c0,6.5-5.3,11.8-11.8,11.8
                                            c-3.4,0-6.8,0-10.3,0c-6.5,0-11.8-5.3-11.8-11.8c0-25.1,0-50.2,0-75.2C10.6,5.9,15.9,0.6,22.4,0.6z M22.4,6.5c3.4,0,6.8,0,10.3,0
                                            c3.2,0,5.9,2.6,5.9,5.9c0,25,0,50.1,0,75.2c0,3.2-2.7,5.9-5.9,5.9c-3.4,0-6.8,0-10.3,0c-3.2,0-5.9-2.7-5.9-5.9
                                            c0-25.1,0-50.2,0-75.2C16.5,9.1,19.2,6.5,22.4,6.5z M67.3,6.5c3.4,0,6.8,0,10.2,0s6,2.6,6,5.9c0,25,0,50.1,0,75.2
                                            c0,3.2-2.7,5.9-6,5.9s-6.7,0-10.2,0c-3.3,0-5.9-2.7-5.9-5.9c0-25.1,0-50.2,0-75.2C61.4,9.1,64,6.5,67.3,6.5z M67.3,0.6
                                            c3.4,0,6.8,0,10.2,0c6.5,0,11.8,5.3,11.8,11.8c0,25,0,50.1,0,75.2c0,6.5-5.3,11.8-11.8,11.8c-3.3,0-6.7,0-10.2,0
                                            c-6.5,0-11.8-5.3-11.8-11.8c0-25.1,0-50.2,0-75.2C55.5,5.9,60.8,0.6,67.3,0.6z"/>
                                    </g>
                                </g>
                            </svg>

                        }
                    </PlayPauseButton>
                </Grid>
                <Grid item xs={9}>
                    <LineSlider 
                        value={dataParams.nIndex} 
                        valueLabelDisplay="on"
                        onChange={handleChange} 
                        getAriaValueText={valuetext}
                        valueLabelFormat={valuetext}
                        aria-labelledby="aria-valuetext"
                        min={startDateIndex}
                        step={1}
                        max={dates[currentData].length-1}
                    />
                </Grid>
                <Grid item xs={2} style={{marginTop:'-120px'}}>
                    <ButtonGroup
                        orientation="vertical"
                        color="primary"
                        aria-label="vertical outlined primary button group"
                        style={{float:'right'}}
                    >
                        <DateButton className={dataParams.nRange === null ? 'active' : ''} onClick={() => handleRangeButton(null)}>Total</DateButton>
                        <DateButton className={dataParams.nRange === 1 ? 'active' : ''} onClick={() => handleRangeButton(1)}>New Daily</DateButton>
                        <DateButton className={dataParams.nRange === 7 ? 'active' : ''} onClick={() => handleRangeButton(7)}>Weekly Average</DateButton>
                        <DateButton className={customRange ? 'active' : ''} onClick={() => handleRangeButton('custom')}>Custom Range</DateButton>
                    </ButtonGroup>
                </Grid>
            </SliderContainer>
        );
    } else {
        return <SliderContainer />
    }
}

export default DateSlider