import React from 'react';
import Grid from '@material-ui/core/Grid';
import {
  LineChart, Line, XAxis, YAxis, ReferenceArea, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useSelector } from 'react-redux';

const MainLineChart = () => {
    
    const chartData = useSelector(state => state.chartData);
    const dataParams = useSelector(state => state.dataParams);
    
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
                    <YAxis type="number" />
                    {/* <YAxis scale="log" domain={['auto', 'auto']} /> */}
                    <Tooltip />
                    {/* <Legend /> */}
                    {/* <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} /> */}
                    <Line type="monotone" dataKey="count" stroke="#ff0000" dot={false} />
                    <ReferenceArea 
                        x1={getStartDate(dataParams.nRange, dataParams.nIndex, chartData)}
                        x2={getEndDate(dataParams.nIndex, chartData)} y1={0} y2={chartData.slice(-1)[0].count}
                        stroke="white" 
                        strokeOpacity={1} 
                        fill="none" 
                        isAnimationActive={true}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Grid>
        </Grid>
    );
}

export default MainLineChart

// dataParams.nIndex-(dataParams.nRange||dataParams.nIndex)