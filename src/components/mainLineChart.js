import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import {
  LineChart, Line, XAxis, YAxis, ReferenceArea, ReferenceLine, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useSelector } from 'react-redux';
import Switch from '@material-ui/core/Switch';
import styled from 'styled-components';

const SwitchContainer = styled(Grid)`
    p {
        display: inline;
        color:white;
    }
    span.MuiSwitch-track {
        background-color:#ddd;
    }
    .Mui-checked {
        color:yellow;
    }
    .Mui-checked + .MuiSwitch-track {
        background-color: yellow;
    }
    .MuiSwitch-colorSecondary:hover {
        background-color:rgba(255,255,0,0.05);
    }
`

const MainLineChart = () => {
    
    const chartData = useSelector(state => state.chartData);
    const dataParams = useSelector(state => state.dataParams);
    const [logChart, setLogChart] = useState(false)
    
    const getStartDate = (range, index, data) => {
        if (range === null) {
            try {
                return data.slice(0,1)[0].date
            } catch {
                return null
            }
        } else {
            try {
                return data[index-range].date
            } catch {
                return null
            }
        }
    }

    const getEndDate = (index, data) => {
        try {
            return data[index].date;
        } catch {
            return null;
        }
    }

    const handleSwitch = () => {
        setLogChart(prev => !prev);
    }

    return (
        <Grid container spacing={2} id="main-chart-container">
            <Grid item xs={10} style={{height:'20vh'}}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 0, right: 10, left: 45, bottom: 20,
                        }}
                    >
                        {/* <CartesianGrid strokeDasharray="3 3" /> */}
                        <XAxis dataKey="date" />
                        {/* <YAxis type="number" /> */}
                        <YAxis yAxisId="left" type="number" dataKey="count"  scale={logChart ? "log" : "linear"} domain={[0.01, 'dataMax']} allowDataOverflow />
                        <YAxis yAxisId="right" orientation="right" dataKey="dailyNew" scale={logChart ? "log" : "linear"} domain={[0.01, 'dataMax']} allowDataOverflow />
                        <Tooltip />
                        <ReferenceArea 
                            yAxisId="left"
                            x1={getStartDate(dataParams.nRange, dataParams.nIndex, chartData)}
                            x2={getEndDate(dataParams.nIndex, chartData)} 
                            fill="white" 
                            fillOpacity={0.15}
                            isAnimationActive={false}
                        />
                        <Line type="monotone" yAxisId="left" dataKey="count" name="Total Count" stroke="#5555ff" dot={false} />
                        <Line type="monotone" yAxisId="right" dataKey="dailyNew" name="Daily Count" stroke="#ff0000" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </Grid>
            <SwitchContainer item xs={2}>
                <Switch
                    checked={logChart}
                    onChange={handleSwitch}
                    name="log chart switch"
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                />
                <p>{logChart ? 'Log Scale' : 'Linear Scale'}</p>
            </SwitchContainer>
        </Grid>
    );
}

export default MainLineChart

// dataParams.nIndex-(dataParams.nRange||dataParams.nIndex)