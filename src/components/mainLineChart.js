import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import {
  LineChart, Line, XAxis, YAxis, ReferenceArea, ReferenceLine, Tooltip, Label, ResponsiveContainer
} from 'recharts';
import { useSelector } from 'react-redux';
import Switch from '@material-ui/core/Switch';
import { SwitchContainer } from '../styled_components';
import styled from 'styled-components';

const ChartContainer = styled(Grid)`
    padding:10px 11.5% 20px 20px;
`

const ChartTitle = styled.h3`
    text-align: left;
    font-family:'Playfair Display', serif;
    padding:0;
    font-weight:normal;
    margin:0;
    color:white;
`
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

const millionFormatter = val => { return `${val/1000000}M` };
const thousandFormatter = val => { return `${val/1000}K` };
const dateFormatter = val => { 
    let tempDate = new Date(val).getMonth();
    return `${monthNames[tempDate]}`
};

const CustomTick = props => {
    return <text {...props}>{props.labelFormatter(props.payload.value)}</text>
};

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

const CustomTooltip = props => {
    if (props.active) {
        let data = props.payload
        return (
            <div 
                style={{
                    background:'#1a1a1a',
                    padding:'1px 10px',
                    borderRadius:'4px',
                    boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)'
            
            }}> 
            <p style={{color:'white', padding:0,}}>{data[0].payload.date}</p>
                {data.map(data => 
                    <p style={{color: data.color, textShadow: '2px 2px 4px #2e2e2e', fontWeight:600}}>{data.name}: {Number.isInteger(Math.floor(data.payload[data.dataKey])) ? 
                        Math.floor(data.payload[data.dataKey]).toLocaleString('en') 
                        : data.payload[data.dataKey]}
                    </p>
                    
                )}
            </div>
        )
    }
    return null;
};

const MainLineChart = () => {
    
    const chartData = useSelector(state => state.chartData);
    const dataParams = useSelector(state => state.dataParams);
    const startDateIndex = useSelector(state => state.startDateIndex);
    const sidebarData = useSelector(state => state.sidebarData);
    const [logChart, setLogChart] = useState(false)
    const { properties
       } = useSelector(state => state.sidebarData);

    const handleSwitch = () => {
        setLogChart(prev => !prev);
    }

    return (
        <ChartContainer container spacing={2} id="main-chart-container">
            <Grid item xs={12}>
                <ChartTitle>Total and Weekly Average Cases{properties && <span>: {properties.NAME}{properties.state_name && `, ${properties.state_name}`}</span>}</ChartTitle>
            </Grid>
            <Grid item xs={12} style={{height:'20vh'}}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 20, right: 10, left: 22, bottom: 20,
                        }}
                    >
                        <XAxis 
                            dataKey="date"
                            tick={
                                <CustomTick
                                style={{
                                    fill: "#FFFFFF99",
                                    fontSize: "10px",
                                    fontFamily: "Lato",
                                    fontWeight: 600,
                                    transform:'translateY(10px)'
                                }}
                                labelFormatter={dateFormatter}
                                />
                            }
                        />
                        {/* <YAxis type="number" /> */}
                        <YAxis yAxisId="left" type="number" dataKey="count"  scale={logChart ? "log" : "linear"} domain={[0.01, 'dataMax']} allowDataOverflow 
                            // ticks={Object.keys(sidebarData).length === 0 ? [2000000,4000000,6000000,8000000,10000000] : []} 
                            tick={
                                <CustomTick
                                style={{
                                    fill: "#D8D8D8",
                                    fontSize: "10px",
                                    fontFamily: "Lato",
                                    fontWeight: 600
                                }}
                                labelFormatter={Object.keys(sidebarData).length === 0 ? millionFormatter : thousandFormatter}
                                />
                            }
                            >
                            <Label value="Total Cases" position='insideLeft' style={{marginTop:10, fill:'#D8D8D8', fontFamily: 'Lato', fontWeight: 600}} angle={-90}  />
                        </YAxis>
                        <YAxis yAxisId="right" orientation="right" dataKey="dailyNew" scale={logChart ? "log" : "linear"} domain={[0.01, 'dataMax']} allowDataOverflow 
                            // ticks={[20000,40000,60000,80000,100000, 120000, 140000]} 
                            tick={
                                <CustomTick
                                    style={{
                                        fill: "#FFCE00",
                                        fontSize: "10px",
                                        fontFamily: "Lato",
                                        fontWeight: 600,
                                    }}
                                    labelFormatter={thousandFormatter}
                                />
                            }
                            >
                            <Label value="Weekly Average" position='insideTopRight' style={{marginTop:10, fill:'#FFCE00', fontFamily: 'Lato', fontWeight: 600}} angle={-90}  />
                        </YAxis>
                        <Tooltip
                            content={CustomTooltip}
                        />
                        <ReferenceArea 
                            yAxisId="left"
                            x1={getStartDate(dataParams.nRange, dataParams.nIndex-startDateIndex, chartData)}
                            x2={getEndDate(dataParams.nIndex-startDateIndex, chartData)} 
                            fill="white" 
                            fillOpacity={0.15}
                            isAnimationActive={false}
                        />
                        <Line type="monotone" yAxisId="left" dataKey="count" name="Total Count" stroke="#D8D8D8" dot={false} />
                        <Line type="monotone" yAxisId="right" dataKey="dailyNew" name="Weekly Average" stroke="#FFCE00" dot={false} />
                        <Line type="monotone" yAxisId="right" dataKey="selectedGeog" name="Selected Geography Count" stroke="#FFF" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </Grid>
            <SwitchContainer item xs={12} style={{position:'absolute', right:0, bottom:40}}>
                <Switch
                    checked={logChart}
                    onChange={handleSwitch}
                    name="log chart switch"
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                />
                <p>{logChart ? 'Log Scale' : 'Linear Scale'}</p>
            </SwitchContainer>
        </ChartContainer>
    );
}

export default MainLineChart

// dataParams.nIndex-(dataParams.nRange||dataParams.nIndex)