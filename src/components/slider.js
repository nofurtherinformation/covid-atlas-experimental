import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import { useSelector, useDispatch } from 'react-redux';
import { setDate, setDateIndex } from '../actions';
// import { getParseCSV, getJson, mergeData, colIndex, getDataForBins } from './utils';

const useStyles = makeStyles({
    root: {
      width: '50%',
      position: 'fixed',
      left: '50%',
      bottom: '20px',
      transform: 'translateX(-50%)',
      padding:'5px 20px',
      boxSizing: 'border-box',
      background: 'black',
      border: '1px solid white'
    },
  });

const DateSlider = () => {
    const classes = useStyles();
    const dispatch = useDispatch();  
    
    const currentData = useSelector(state => state.currentData);
    const dates = useSelector(state => state.dates);
    const currDate = useSelector(state => state.currDate);
    const currDateIndex = useSelector(state => state.currDateIndex);
    
    const updateDateIndex = (val) => dispatch(setDateIndex(val));
    const updateDate = (val) => dispatch(setDate(dates[currentData][val]));

    const handleChange = (event, newValue) => {
        updateDate(newValue)
        updateDateIndex(newValue)
    };
    if (dates[currentData] !== undefined) {
        return (
            <div className={classes.root}>
                <h4 style={{textAlign:"center", color:"white"}}>{currDate}</h4>
                <Slider 
                    value={currDateIndex} 
                    onChange={handleChange} 
                    aria-labelledby="continuous-slider"
                    min={0}
                    step={1}
                    max={dates[currentData].length-1}
                />
            </div>
        );
    } else {
        return <div className={classes.root} />
    }
}

export default DateSlider