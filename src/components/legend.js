import React from 'react';
import Grid from '@material-ui/core/Grid';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const LegendContainer = styled.div`
    width:100%;
    padding:20px;
    margin:0;
    box-sizing: border-box;
`

const LegendTitle = styled.h3`
    text-align: left;
    font-family:'Montserrat', sans-serif;
    padding:0 0 10px 0;
    margin:0;
    color:white;
`

const BinLabels = styled.div`
    width:100%;
    display: flex;
    box-sizing: border-box;
    padding: 0 ${props => props.binLength > 6 ? 100/props.binLength/2-1 : 0}%;
    .bin { 
        height:10px;
        display: inline;
        border:0;
        margin:0;
        flex:2;
        color:white;
        font-size:10px;
        text-align: center;
    }
    .bin:nth-of-type(1) {
        transform: ${props => props.firstBinZero ? 'translateX(-45%)' : 'none'};
    }
`
const BinBars = styled.div`
    width:100%;
    display: flex;
    box-sizing: border-box;
    .bin { 
        height:10px;
        display: inline;
        flex:1;
        border:0;
        margin:0;
    }
    .bin:nth-of-type(1) {
        transform: ${props => props.firstBinZero ? 'scaleX(0.35)' : 'none'};
    }
`


const Legend =  () => {
    const mapParams = useSelector(state => state.mapParams)
    const dataParams = useSelector(state => state.dataParams)
    const title = useSelector(state => state.currentVariable)

    const cleanBins = (bins) => {
        if (bins === undefined) {
            return;
        } else if (bins.slice(-1,)[0] !==`>${bins.slice(-2,-1)[0]}`) {
            return bins
        }
        bins.splice(0, 1, `<${bins[0]}`)
        bins.splice(-2, 1)
        return bins
    }

    return (
        <LegendContainer>
            <Grid container spacing={2} id='legend-bins-container'>
                <Grid item xs={6}>
                    <LegendTitle>
                        {title}
                    </LegendTitle>
                </Grid>
                <Grid item xs={6}>
                    <BinBars firstBinZero={`${mapParams.colorScale[0]}` === `240,240,240`}>
                        {
                            mapParams.colorScale !== undefined && 
                            mapParams.colorScale.map(color => <div className="bin color" key={`${color[0]}${color[1]}`}style={{backgroundColor:`rgb(${color[0]},${color[1]},${color[2]})`}}></div>)
                        }
                    </BinBars>
                    <BinLabels firstBinZero={`${mapParams.colorScale[0]}` === `240,240,240`} binLength={mapParams.bins.bins.length}>
                        {`${mapParams.colorScale[0]}` === `240,240,240` && <div className="bin firstBin">0</div>}

                        {
                            mapParams.bins.bins !== undefined && 
                            cleanBins(mapParams.bins.bins).map(label => <div className="bin label" key={label}>{label}</div>)
                        }
                    </BinLabels>
                </Grid>
            </Grid>
        </LegendContainer>
    )
}

export default Legend