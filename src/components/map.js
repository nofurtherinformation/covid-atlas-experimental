import { useState } from 'react';
import DeckGL from '@deck.gl/react';
import {MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import ReactMapGL from 'react-map-gl';
import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
import { useSelector, useDispatch } from 'react-redux';
import { setDataSidebar } from '../actions';
import { mapFn, dataFn } from '../utils';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibGl4dW45MTAiLCJhIjoiY2locXMxcWFqMDAwenQ0bTFhaTZmbnRwaiJ9.VRNeNnyb96Eo-CorkJmIqg';

const initialViewState = {
    latitude: 35.850033,
    longitude: -105.6500523,
    zoom: 3.5,
    pitch:0,
    bearing:0
}
const DATA_URL = {
    CONTINENTS: `${process.env.PUBLIC_URL}/geojson/world50m.json`
}

const viewGlobe = new GlobeView({id: 'globe', controller: false, resolution:1});
const view = new MapView({repeat: true});

const Map = () => { 
    
    const [hoverInfo, setHoverInfo] = useState(false);
    const [globalMap, setGlobalMap] = useState(false);

    const storedData = useSelector(state => state.storedData);
    const currentData = useSelector(state => state.currentData);
    const currDateIndex = useSelector(state => state.currDateIndex);
    const bins = useSelector(state => state.bins);
    const colorScale = useSelector(state => state.colorScale);
    const use3D = useSelector(state => state.use3D);
    const dataParams = useSelector(state => state.dataParams);
    const dispatch = useDispatch();

    const GetFillColor = (f, bins) => bins.hasOwnProperty("bins") ? mapFn(dataFn(f[dataParams.numerator], currDateIndex, dataParams.nRange, f[dataParams.denominator], dataParams.dProperty, dataParams.dIndex, dataParams.dRange, dataParams.scale), bins.breaks, colorScale) : [0,0,0]
    const GetHeight = (f, bins) => bins.hasOwnProperty("bins") ? dataFn(f[dataParams.numerator], currDateIndex, dataParams.nRange, f[dataParams.denominator], dataParams.dProperty, dataParams.dIndex, dataParams.dRange, dataParams.scale)*1000 : 0
    
    const Layers = [
        new GeoJsonLayer({
            id: 'base continents',
            data: DATA_URL.CONTINENTS,
            pickable: false,
            stroked: false,
            filled: true,
            wireframe: false,
            getFillColor: [30,30,30]
        }),
        new GeoJsonLayer({
            id: 'choropleth',
            data: {
                "type": "FeatureCollection",
                "name": currentData,
                "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                "features": storedData[currentData] ? storedData[currentData] : [],
            },
            pickable: true,
            stroked: false,
            filled: true,
            wireframe: false,
            extruded:use3D,
            opacity: use3D ? 1 : 0.5,
            getFillColor: f => GetFillColor(f, bins),
            getElevation: f => GetHeight(f, bins),
            updateTriggers: {
                data: currentData,
                getFillColor: currDateIndex,
                getElevation: currDateIndex,
            },
            onHover: info => setHoverInfo(info),
            onClick: info => dispatch(setDataSidebar(info.object)),
            autoHighlight: true,
        }),
    ]

    return (
        <div id="mapContainer" style={{position:'fixed',left:0,top:0,width:'100%',height:'100%'}}>
            <DeckGL
            initialViewState={initialViewState}
            controller={true}
            layers={Layers}
            views={globalMap ? viewGlobe : view} //enable this for globe view
            >
                <ReactMapGL
                    reuseMaps
                    mapStyle={'mapbox://styles/lixun910/ckhkoo8ix29s119ruodgwfxec'}
                    preventStyleDiffing={true}
                    mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
                    >
                </ReactMapGL >
                {hoverInfo.object && (
                <div style={{position: 'absolute', zIndex: 1, pointerEvents: 'none', left: hoverInfo.x, top: hoverInfo.y, background: 'white', padding:'0 10px'}}>
                    <h5>{`${hoverInfo.object.properties.NAME},${hoverInfo.object.properties.state_name}`}</h5>
                    {`Cases: ${hoverInfo.object.cases.slice(-1,)[0]}`}<br/>
                    {`Deaths: ${hoverInfo.object.deaths.slice(-1,)[0]}`}<br/>
                    {`New Cases: ${hoverInfo.object.cases.slice(-1,)[0]-hoverInfo.object.cases.slice(-2,-1)[0]}`}<br/>
                    {`New Deaths: ${hoverInfo.object.deaths.slice(-1,)[0]-hoverInfo.object.deaths.slice(-2,-1)[0]}`}<br/>
                    </div>
                )}
            </DeckGL>
        </div>
    ) 
}

export default Map