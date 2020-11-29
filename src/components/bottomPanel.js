// this components houses the slider, legend, and bottom dock chart
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import styled from 'styled-components';

import { Legend, DateSlider, MainLineChart } from '../components';
import { setPanelState } from '../actions';

// helper function to get dock offset
const getChartHeight = () => { try { return document.querySelector('#main-chart-container').offsetHeight} catch { return 0} }

// Styled components
const BottomDrawer = styled.div`
    position: fixed;
    bottom:-${props => props.bottom}px;
    left:50%;
    background:#2b2b2b;
    transform:translateX(-50%);
    width:90vw;
    max-width: 960px;
    box-sizing: border-box;
    padding:0;
    margin:0;
    box-shadow: 0px 0px 5px rgba(0,0,0,0.7);
    border-radius:0.5vh 0.5vh 0 0;
    transition:250ms all;
    hr {
        opacity:0.5;
    }
`
const OpenCloseButton = styled.button`
    background: none;
    position:absolute;
    right:5px;
    bottom:${props => props.bottom}px;
    width:40px;
    height:40px;
    padding:0;
    transform:${props => props.bottom===5?'rotate(270deg)':'rotate(90deg)'};
    border:none;
    outline:none;
    transition:250ms all;
    svg {
        fill:white;
        width:
    }
    &.hidden {
        bottom:;
        transform:;
    }
`

const BottomPanel = () => {

    const dispatch = useDispatch();

    const panelState = useSelector(state => state.panelState);

    // offset for the bottom panel based on the chart height, 
    // managed through props via styled-components
    const [bottomMargin, setBottomMargin] = useState(0);
    const handleBottomOpen = () => {
        if (panelState.chart) {
            setBottomMargin(getChartHeight())
            dispatch(setPanelState({chart:false}))
        } else {
            setBottomMargin(getChartHeight())
            dispatch(setPanelState({chart:true}))

        }
    }
    
    const handleResize = () => setBottomMargin(getChartHeight())
    window.addEventListener("resize", handleResize);
    
    return (
        <BottomDrawer bottom={panelState.chart ? 0 : bottomMargin }>
            <Legend />
            <DateSlider />
            <hr />
            <MainLineChart />
            <OpenCloseButton onClick={handleBottomOpen} bottom={panelState.chart ? 5 : bottomMargin}>
                <svg version="1.1" x="0px" y="0px" viewBox="0 0 100 100">
                    <g transform="translate(50 50) scale(0.69 0.69) rotate(0) translate(-50 -50)">
                        <path d="M38,33.8L23.9,47.9c-1.2,1.2-1.2,3.1,0,4.2L38,66.2l4.2-4.2l-9-9H71v17c0,0.6-0.4,1-1,1H59v6h11
                        c3.9,0,7-3.1,7-7V30c0-3.9-3.1-7-7-7H59v6h11c0.6,0,1,0.4,1,1v17H33.2l9-9L38,33.8z"/>
                    </g>
                </svg>
            </OpenCloseButton>
        </BottomDrawer>
    )

}

export default BottomPanel