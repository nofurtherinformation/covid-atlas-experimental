import React from 'react';
import Grid from '@material-ui/core/Grid';

const Legend = ( props ) => {

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
        <div id='legend'>
            <Grid container spacing={2} id='legend-bins-container'>
                <Grid item xs={6}>
                    <h3>
                        {props.title !== undefined && props.title}
                    </h3>
                </Grid>
                <Grid item xs={6}>
                    <div id="binBars">
                        {props.colors !== undefined && 
                            props.colors.map(color => <div className="bin color" key={`${color[0]}${color[1]}`}style={{backgroundColor:`rgb(${color[0]},${color[1]},${color[2]})`}}></div>)
                        }
                    </div>
                    <div id="binLabels" style={{padding: (`0 ${props.labels !== undefined ? 100/props.labels.length/2-1 : 0}%`) }}>
                        <div className="bin label">0</div>
                        {props.labels !== undefined && 
                            cleanBins(props.labels).map(label => <div className="bin label" key={label}>{label}</div>)
                        }
                    </div>
                </Grid>
            </Grid>
        </div>
    )
}

export default Legend