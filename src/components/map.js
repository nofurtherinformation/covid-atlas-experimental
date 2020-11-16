import DeckGL from '@deck.gl/react';
import {MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import ReactMapGL from 'react-map-gl';
import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
import { useSelector, useDispatch } from 'react-redux';

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

// const view = new GlobeView({id: 'globe', controller: false, resolution:1});
const view = new MapView({repeat: true});

const Map = () => { 

    const storedData = useSelector(state => state.storedData);
    const currentData = useSelector(state => state.currentData);
    const currDateIndex = useSelector(state => state.currDateIndex);
    const bins = useSelector(state => state.bins);
    const colorScale = useSelector(state => state.colorScale);
    const dataFn = useSelector(state => state.currentDataFn);
    const mapFn = useSelector(state => state.currentMapFn);
    const use3D = useSelector(state => state.use3D);

    const GetFillColor = (f, bins) => bins.hasOwnProperty("bins") ? mapFn(dataFn(f, 'cases', currDateIndex, 7), bins.breaks, colorScale) : [0,0,0]
    const GetHeight = (f, bins) => bins.hasOwnProperty("bins") ? dataFn(f, 'cases', currDateIndex, 7)*1000 : 0
    
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
            getFillColor: f => GetFillColor(f, bins),
            getElevation: f => GetHeight(f, bins),
            updateTriggers: {
                data: currentData,
                getFillColor: currDateIndex,
                getElevation: currDateIndex,
            },
        }),
    ]

    return (
        <div id="mapContainer" style={{position:'fixed',left:0,top:0,width:'100%',height:'100%'}}>
            <DeckGL
            initialViewState={initialViewState}
            controller={true}
            layers={Layers}
            views={view} //enable this for globe view
            >
                <ReactMapGL
                    reuseMaps
                    mapStyle={'mapbox://styles/lixun910/ckhkoo8ix29s119ruodgwfxec'}
                    preventStyleDiffing={true}
                    mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
                    >
                </ReactMapGL >
            </DeckGL>
        </div>
        // <DeckGL viewState={viewState}
        // layers={[layer]}
        // getTooltip={({object}) => object && `${object.zipcode}\nPopulation: ${object.population}`} />;
    )
 
}

export default Map