import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import {MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import ReactMapGL from 'react-map-gl';
import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
import { useSelector, useDispatch } from 'react-redux';
import { setDataSidebar } from '../actions';
import { mapFn, dataFn, getVarId } from '../utils';
import { lisaColorScale } from '../config';

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
    const storedGeojson = useSelector(state => state.storedGeojson);
    const currentData = useSelector(state => state.currentData);
    const storedLisaData = useSelector(state => state.storedLisaData);
    
    const dataParams = useSelector(state => state.dataParams);
    const mapParams = useSelector(state => state.mapParams);

    const colorScale = useSelector(state => state.colorScale);
    
    const dispatch = useDispatch();

    const [currLisaData, setCurrLisaData] = useState({})

    useEffect(() => {
        let tempData = storedLisaData[getVarId(currentData, dataParams)]
        if (tempData !== undefined) setCurrLisaData(tempData);
    }, [storedLisaData, dataParams, mapParams])

    const GetFillColor = (f, bins, mapType) => {
        if (!bins.hasOwnProperty("bins")) {
            return [0,0,0]
        } else if (mapType === 'lisa') {
            return lisaColorScale[currLisaData[storedGeojson[currentData]['geoidOrder'][f.properties.GEOID]]]
        } else {
            return mapFn(dataFn(f[dataParams.numerator], dataParams.nProperty, dataParams.nIndex, dataParams.nRange, f[dataParams.denominator], dataParams.dProperty, dataParams.dIndex, dataParams.dRange, dataParams.scale), bins.breaks, colorScale) 
        }
    }
    
    const GetHeight = (f, bins) => bins.hasOwnProperty("bins") ? dataFn(f[dataParams.numerator], dataParams.nProperty, dataParams.nIndex, dataParams.nRange, f[dataParams.denominator], dataParams.dProperty, dataParams.dIndex, dataParams.dRange, dataParams.scale)*1000 : 0
    
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
            visible: mapParams.mapType !== 'cartogram',
            pickable: true,
            stroked: false,
            filled: true,
            wireframe: false,
            extruded: mapParams.use3d,
            opacity: mapParams.use3d ? 1 : 0.5,
            getFillColor: f => GetFillColor(f, mapParams.bins, mapParams.mapType),
            getElevation: f => GetHeight(f, mapParams.bins, mapParams.mapType),
            updateTriggers: {
                data: currentData,
                getFillColor: [dataParams, mapParams],
                getElevation: [dataParams, mapParams],
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