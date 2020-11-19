import React from 'react';
import Grid from '@material-ui/core/Grid';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useSelector } from 'react-redux';

const MainLineChart = () => {
    
    const chartData = useSelector(state => state.chartData);
    return (
        <Grid container spacing={2} id="main-chart-container">
            <Grid item xs={10} style={{height:'100%'}}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 0, right: 10, left: 45, bottom: 20,
                        }}
                    >
                    {/* <CartesianGrid strokeDasharray="3 3" /> */}
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    {/* <Legend /> */}
                    {/* <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} /> */}
                    <Line type="monotone" dataKey="count" stroke="#82ca9d" dot={false} />
                    {/* {
                        Object.keys(chartData[0]).map(key => {
                            if(key!=="count") {
                                return <Line type="monotone" dataKey={`${key}`} key={`${key}`} stroke="#82ca9d" dot={false} />
                            }
                        })
                    } */}
                    </LineChart>
                </ResponsiveContainer>
            </Grid>
        </Grid>
    );
}

export default MainLineChart