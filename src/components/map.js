import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import {fromJS} from 'immutable';

import DeckGL from '@deck.gl/react';
import {MapView, _GlobeView as GlobeView, FlyToInterpolator} from '@deck.gl/core';
import { GeoJsonLayer, PolygonLayer, ScatterplotLayer,  IconLayer } from '@deck.gl/layers';
// import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
// import {IcoSphereGeometry} from '@luma.gl/engine';

import ReactMapGL, {NavigationControl, GeolocateControl } from 'react-map-gl';
import Geocoder from 'react-map-gl-geocoder'

import { MapTooltipContent } from '../components';
import { colorScales } from '../config';
import { setDataSidebar, setMapParams } from '../actions';
import { mapFn, dataFn, getVarId, getCSV } from '../utils';
import MAP_STYLE from '../config/style.json';

// const cartoGeom = new IcoSphereGeometry({
//   iterations: 1
// });

const ICON_MAPPING = {
    hospital: {x: 0, y: 0, width: 128, height: 128},
    clinic: {x: 128, y: 0, width: 128, height: 128},
  };

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibGl4dW45MTAiLCJhIjoiY2locXMxcWFqMDAwenQ0bTFhaTZmbnRwaiJ9.VRNeNnyb96Eo-CorkJmIqg';

const defaultMapStyle = fromJS(MAP_STYLE);

const initialViewState = {
    latitude: 35.850033,
    longitude: -105.6500523,
    zoom: 3.5,
    pitch:0,
    bearing:0
};

const DATA_URL = {
    CONTINENTS: `${process.env.PUBLIC_URL}/geojson/world50m.json`,
    BLACKBELT:`${process.env.PUBLIC_URL}/geojson/blackbelt_highlight.geojson`,
    SEG_CITIES:`${process.env.PUBLIC_URL}/geojson/seg_cities.geojson`,
    CONGRESS_DISTRICTS:`${process.env.PUBLIC_URL}/geojson/districts.geojson`,
    CONGRESS_CENTROIDS:`${process.env.PUBLIC_URL}/geojson/district_centroids.geojson`,
    RESERVATIONS:`${process.env.PUBLIC_URL}/geojson/reservations.geojson`
};

const HoverDiv = styled.div`
    background:#2b2b2b;
    padding:20px;
    color:white;
    box-shadow: 0px 0px 5px rgba(0,0,0,0.7);
    border-radius:0.5vh 0.5vh 0 0;
    h3 {
        margin:2px 0;
    }
`;

const NavInlineButton = styled.button`
    width:29px;
    height:29px;
    padding:5px;
    margin-bottom:10px;
    display:block;
    background-color: ${props => props.isActive ? 'yellow' : '#f5f5f5'};
    -moz-box-shadow: 0 0 2px rgba(0,0,0,.1);
    -webkit-box-shadow: 0 0 2px rgba(0,0,0,.1);
    box-shadow: 0 0 0 2px rgba(0,0,0,.1);
    border-radius: 4px;
    outline:none;
    border:none;
    transition:250ms all;
`

const NavBarBacking = styled.div`
width:100%;
height:50px;
position:absolute;
top:0;
left:0;
background:#2b2b2b;
-moz-box-shadow: 0 0 2px rgba(0,0,0,.1);
-webkit-box-shadow: 0 0 2px rgba(0,0,0,.1);
box-shadow: 0 0 0 2px rgba(0,0,0,.1);
`

const viewGlobe = new GlobeView({id: 'globe', controller: false, resolution:1});
const view = new MapView({repeat: true});


const Map = () => { 
    
    const [hoverInfo, setHoverInfo] = useState(false);
    const [highlightGeog, setHighlightGeog] = useState(false);
    const [globalMap, setGlobalMap] = useState(false);
    const [mapStyle, setMapStyle] = useState(defaultMapStyle);
    const [currLisaData, setCurrLisaData] = useState({})
    const [viewState, setViewState] = useState(initialViewState)
    const [cartogramData, setCartogramData] = useState([]);
    const [currVarId, setCurrVarId] = useState(null);
    const [hospitalData, setHospitalData] = useState(null);
    const [clinicData, setClinicData] = useState(null);

    const storedData = useSelector(state => state.storedData);
    const storedGeojson = useSelector(state => state.storedGeojson);
    const currentData = useSelector(state => state.currentData);
    const storedLisaData = useSelector(state => state.storedLisaData);
    const storedCartogramData = useSelector(state => state.storedCartogramData);
    const panelState = useSelector(state => state.panelState);

    const dataParams = useSelector(state => state.dataParams);
    const mapParams = useSelector(state => state.mapParams);
    
    const dispatch = useDispatch();

    useEffect(() => {
        let arr = [];
        if (storedData[currentData] && mapParams.vizType === 'cartogram') {
            for (let i=0; i<storedData[currentData].length; i++) {
                arr.push({id:i})
            }
        }
        setCartogramData(arr)
    }, [storedData, mapParams.vizType])

    useEffect(() => {
        setCurrVarId(getVarId(currentData, dataParams))
    }, [dataParams, mapParams])


    useEffect(() => {
        switch(mapParams.vizType) {
            case '2D': 
                setViewState(view => ({
                    ...view,
                    latitude: 35.850033,
                    longitude: -105.6500523,
                    zoom: 3.5,
                    bearing:0,
                    pitch:0
                }));
                break
            case '3D':
                setViewState(view => ({
                    ...view,
                    latitude: 35.850033,
                    longitude: -105.6500523,
                    zoom: 3.5,
                    bearing:-30,
                    pitch:30
                }));
                break
            case 'cartogram':
                setViewState(view => ({
                    ...view,
                    latitude: 11.673,
                    longitude: -31.061,
                    zoom: 4.2,
                    bearing:0,
                    pitch:0
                }));
                break
            default:
                //
        }
    }, [mapParams.vizType])

    useEffect(() => {
        let tempData = storedLisaData[getVarId(currentData, dataParams)]
        if (tempData !== undefined) setCurrLisaData(tempData);
    }, [storedLisaData, dataParams, mapParams])

    useEffect(() => {

        const defaultLayers = defaultMapStyle.get('layers');

        let tempLayers = defaultLayers.map(layer => {
            if (mapParams.resource.includes(layer.get('id')) || mapParams.overlay.includes(layer.get('id'))) {
                return layer.setIn(['layout', 'visibility'], 'visible');
            } else {
                return layer;
            }
        })

        setMapStyle(defaultMapStyle.set('layers', tempLayers))

    }, [mapParams.overlay])

    useEffect(() => {
        if (hospitalData === null) {
            getCSV('https://raw.githubusercontent.com/covidcaremap/covid19-healthsystemcapacity/master/data/published/us_healthcare_capacity-facility-CovidCareMap.csv')
            .then(values => setHospitalData(values))
        }

        if (clinicData === null) {
            getCSV(`${process.env.PUBLIC_URL}/csv/health_centers.csv`)
            .then(values => setClinicData(values))
        }
    },[])
    const mapRef = useRef();
    
    const GetFillColor = (f, bins, mapType) => {
        if (!bins.hasOwnProperty("bins")) {
            return [0,0,0]
        } else if (mapType === 'lisa') {
            return colorScales.lisa[currLisaData[storedGeojson[currentData]['geoidOrder'][f.properties.GEOID]]]
        } else {
            return mapFn(dataFn(f[dataParams.numerator], dataParams.nProperty, dataParams.nIndex, dataParams.nRange, f[dataParams.denominator], dataParams.dProperty, dataParams.dIndex, dataParams.dRange, dataParams.scale), bins.breaks, mapParams.colorScale, mapParams.mapType) 
        }
    }
    
    const GetHeight = (f, bins) => bins.hasOwnProperty("bins") ? dataFn(f[dataParams.numerator], dataParams.nProperty, dataParams.nIndex, dataParams.nRange, f[dataParams.denominator], dataParams.dProperty, dataParams.dIndex, dataParams.dRange, dataParams.scale)*1000 : 0
    
    const handle3dButton = (using3d) => {
        if (using3d) {
            dispatch(setMapParams({vizType: '2D'}))
            setViewState(view => ({
                ...view,
                bearing:0,
                pitch:0,
                zoom: 3.5,
                transitionInterpolator: new FlyToInterpolator(),
                transitionDuration: 250,
            }))
        } else {
            dispatch(setMapParams({vizType: '3D'}))
            setViewState(view => ({
                ...view,
                bearing:-30,
                pitch:45,
                zoom: 3.5,
                transitionInterpolator: new FlyToInterpolator(),
                transitionDuration: 250,
            }))
        }
    }
    
    const handleGeolocate = (viewState) => {
        setViewState(view => ({
            ...view,
            latitude: viewState.coords.latitude,
            longitude: viewState.coords.longitude,
            zoom: 8,
            transitionInterpolator: new FlyToInterpolator(),
            transitionDuration: 250,
        }))
    }

    const getCartogramPosition = (data) => data.position;
    const getCartogramScale = (data) => [data.radius, data.radius, data.radius*10];
    const getCartogramFillColor = (val, bins, mapType) => {
        if (!bins.hasOwnProperty("bins")) {
            return [0,0,0]
        // } else if (mapType === 'lisa') {
        //     return colorScales.lisa[currLisaData[storedGeojson[currentData]['geoidOrder'][f.properties.GEOID]]]
        } else {
            return mapFn(val, bins.breaks, mapParams.colorScale, mapParams.mapType) 
        }
    }
    const getCartogramTranslation = (data) => [0, 0, data.radius*30];
    // const getCartogramColor = () => mapFn(, bins.breaks, mapParams.colorScale, mapParams.mapType)
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
            wireframe: mapParams.vizType === '3D',
            extruded: mapParams.vizType === '3D',
            opacity: mapParams.vizType === '3D' ? 0.9 : mapParams.resource === '' ? 0.5 : 0.25,
            getFillColor: f => GetFillColor(f, mapParams.bins, mapParams.mapType),
            getElevation: f => GetHeight(f, mapParams.bins, mapParams.mapType),
            updateTriggers: {
                data: currentData,
                getFillColor: [dataParams, mapParams],
                getElevation: [dataParams, mapParams],
            },
            onHover: info => {
                try {
                    setHoverInfo(info)
                } catch {
                    setHoverInfo(null)
                }
            },
            onClick: info => {
                try {
                    dispatch(setDataSidebar(info.object));
                    setHighlightGeog(info.object.properties.GEOID);
                } catch {}

            }
        }),
        new GeoJsonLayer({
            id: 'highlightLayer',
            data: {
                "type": "FeatureCollection",
                "name": currentData,
                "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                "features": storedData[currentData] ? storedData[currentData] : [],
            },
            pickable: false,
            stroked: true,
            filled:false,
            getLineColor: f => (highlightGeog === f.properties.GEOID ? [255,255,255] : [255,255,255,0]), 
            lineWidthScale: 10,
            getLineWidth: 1,
            lineWidthMinPixels: 2,
            updateTriggers: {
                data: currentData,
                getLineColor: highlightGeog,
            },
        }),
        new IconLayer({
            id: 'hospital-layer',
            data: hospitalData,
            visible: mapParams.resource.includes('hospital'),
            iconAtlas: `${process.env.PUBLIC_URL}/assets/img/icon_atlas.png`,
            iconMapping: ICON_MAPPING,
            getIcon: d => 'hospital',
            getPosition: d => [d.Longitude, d.Latitude],
            sizeUnits: 'meters',
            getSize: 12500,
            sizeMinPixels:6,
            sizeMaxPixels:20,
            updateTriggers: {
                data: hospitalData,
                visible: mapParams
            }
        }),
        new IconLayer({
            id: 'clinics-layer',
            data: clinicData,
            visible: mapParams.resource.includes('clinic'),
            iconAtlas: `${process.env.PUBLIC_URL}/assets/img/icon_atlas.png`,
            iconMapping: ICON_MAPPING,
            getIcon: d => 'clinic',
            getPosition: d => [d.lon, d.lat],
            sizeUnits: 'meters',
            getSize: 12500,
            sizeMinPixels:6,
            sizeMaxPixels:20,
            updateTriggers: {
                data: clinicData,
                visible: mapParams
            }
        }),
        new GeoJsonLayer({
            id: 'blackbelt',
            data: DATA_URL.BLACKBELT,
            pickable: false,
            stroked: false,
            filled:true,
            getLineColor: [0,0,0],
            opacity:0.2,
            visible: mapParams.overlay === "blackbelt",
            updateTriggers: {
                visible: mapParams
            },
        }),
        new GeoJsonLayer({
            id: 'segregated cities',
            data: DATA_URL.SEG_CITIES,
            pickable: false,
            stroked: false,
            filled:true,
            getLineColor: [0,0,0],
            opacity:0.2,
            visible: mapParams.overlay === "segregated_cities",
            updateTriggers: {
                visible: mapParams
            },
        }),
        new GeoJsonLayer({
            id: 'native american reservations',
            data: DATA_URL.RESERVATIONS,
            pickable: false,
            stroked: false,
            filled:true,
            getLineColor: [0,0,0],
            opacity:0.2,
            visible: mapParams.overlay === "native_american_reservations",
            updateTriggers: {
                visible: mapParams
            },
        }),
        new GeoJsonLayer({
            id: 'uscongressional_districts',
            data: DATA_URL.CONGRESS_DISTRICTS,
            pickable: false,
            stroked: true,
            filled:false,
            getLineColor: [0,0,0],
            lineWidthMinPixels:1,
            visible: mapParams.overlay === "uscongressional_districts",
            updateTriggers: {
                visible: mapParams
            },
        }),
        new PolygonLayer({
            id: 'background',
            data: [
                // prettier-ignore
                [[-180, 90], [0, 90], [180, 90], [180, -90], [0, -90], [-180, -90]]
            ],
            opacity: 1,
            getPolygon: d => d,
            stroked: false,
            filled: true,
            visible: mapParams.vizType === 'cartogram',
            getFillColor: [10,10,10],
            updateTriggers: {
                visible: mapParams.vizType
            }
        }),
        new ScatterplotLayer({
            id: 'cartogram layer',
            data: cartogramData,
            visible: mapParams.vizType === 'cartogram',
            getPosition: f => storedCartogramData[currVarId][f.id].position,
            getFillColor: f => getCartogramFillColor(storedCartogramData[currVarId][f.id].value, mapParams.bins, mapParams.mapType),
            getRadius: f => storedCartogramData[currVarId][f.id].radius*10,
            transitions: {
                getPosition: 150,
                getFillColor: 150,
                getRadius: 150
            },   
            updateTriggers: {
                getPosition: [storedCartogramData, mapParams, dataParams, currVarId],
                getFillColor: [storedCartogramData, mapParams, dataParams, currVarId],
                getRadius: [storedCartogramData, mapParams, dataParams, currVarId],
                visible: [storedCartogramData, mapParams, dataParams, currVarId]
            }
          }),
        // new SimpleMeshLayer({
        //     id: 'cartogram layer',
        //     data: cartogramData,
        //     // texture: 'texture.png',
        //     sizeScale:10,
        //     visible: mapParams.vizType === 'cartogram',
        //     mesh: cartoGeom,
        //     getPosition:f => getCartogramPosition(storedCartogramData[currVarId][f.id]),
        //     getColor: f => getCartogramFillColor(storedCartogramData[currVarId][f.id].value, mapParams.bins, mapParams.mapType),
        //     getScale: f => getCartogramScale(storedCartogramData[currVarId][f.id]),
        //     // getTranslation: f => getCartogramTranslation(storedCartogramData[currVarId][f.id]),
        //     transitions: {
        //         getPosition: 150,
        //         getColor: 150,
        //         getScale: 150,
        //         getTranslation: 150
        //     },   
        //     updateTriggers: {
        //         getPosition: [mapParams, dataParams, currVarId],
        //         getColor: [mapParams, dataParams, currVarId],
        //         getScale: [mapParams, dataParams, currVarId],
        //         getTranslation: [mapParams, dataParams, currVarId]
        //     }
        //   })
    ]

    return (
        <div id="mapContainer" style={{position:'fixed',left:0,top:0,width:'100%',height:'100%'}}>
            <DeckGL
                initialViewState={viewState}
                controller={true}
                layers={Layers}
                views={globalMap ? viewGlobe : view} //enable this for globe view
            >
                <ReactMapGL
                    reuseMaps
                    ref={mapRef}
                    mapStyle={mapStyle} //{globalMap || mapParams.vizType === 'cartogram' ? 'mapbox://styles/lixun910/ckhtcdx4b0xyc19qzlt4b5c0d' : 'mapbox://styles/lixun910/ckhkoo8ix29s119ruodgwfxec'}
                    preventStyleDiffing={true}
                    mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
                    >
                        
                    <Geocoder
                    mapRef={mapRef}
                    onViewportChange={viewState  => setViewState(viewState)} 
                    mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
                    position="top-right"
                    style={{transform:'translateY(-5px)'}}
                    />
                    <NavBarBacking />
                        
                    <div style={{position: 'absolute', right: panelState.info ? 317 : 10, bottom: 30, zIndex: 10, transition: '250ms all'}}>
                        {/* <NavInlineButton
                            onClick={() => setGlobalMap(prev => !prev)}
                            isActive={globalMap}
                        >
                            <svg  x="0px" y="0px" viewBox="0 0 100 100" >
                                <g transform="translate(50 50) scale(0.69 0.69) rotate(0) translate(-50 -50)">
                                    <g>
                                        <path d="M50-21c-39.2,0-71,31.9-71,71c0,39.2,31.9,71,71,71c39.2,0,71-31.9,71-71C121,10.8,89.2-21,50-21z M50-10.9
                                            c1.7,0,3.7,0.9,6.1,3.5c2.4,2.7,4.9,7,7.1,12.5c2.1,5.4,3.8,12.1,5.1,19.4H31.7c1.2-7.4,3-14,5.1-19.4c2.1-5.6,4.7-9.9,7.1-12.5
                                            C46.3-10,48.3-10.9,50-10.9z M32-8.2c-1.7,2.9-3.3,6.1-4.7,9.7c-2.6,6.7-4.6,14.5-5.9,23.1H-5.3C1.8,9,15.4-3.1,32-8.2z M68-8.2
                                            C84.6-3.1,98.2,9,105.3,24.6H78.6C77.2,16,75.2,8.2,72.7,1.5C71.3-2.1,69.7-5.3,68-8.2z M-8.9,34.8h29.1c-0.4,4.9-0.7,10-0.7,15.2
                                            c0,5.2,0.2,10.3,0.7,15.2H-8.9c-1.3-4.9-2-10-2-15.2C-10.9,44.7-10.2,39.6-8.9,34.8z M30.5,34.8h39c0.5,4.9,0.8,9.9,0.8,15.2
                                            c0,5.3-0.3,10.3-0.8,15.2h-39c-0.5-4.9-0.8-9.9-0.8-15.2C29.7,44.7,30,39.7,30.5,34.8z M79.8,34.8h29.1c1.3,4.9,2,10,2,15.2
                                            c0,5.3-0.7,10.4-2,15.2H79.8c0.4-4.9,0.7-10,0.7-15.2C80.4,44.8,80.2,39.7,79.8,34.8z M-5.3,75.4h26.8c1.3,8.6,3.3,16.4,5.9,23.1
                                            c1.4,3.6,2.9,6.8,4.7,9.7C15.4,103.1,1.8,91-5.3,75.4z M31.7,75.4h36.5c-1.2,7.4-3,14-5.1,19.5c-2.1,5.6-4.7,9.9-7.1,12.5
                                            c-2.4,2.7-4.4,3.5-6.1,3.5s-3.7-0.9-6.1-3.5c-2.4-2.7-4.9-7-7.1-12.5C34.7,89.4,33,82.8,31.7,75.4z M78.6,75.4h26.8
                                            C98.2,91,84.6,103.1,68,108.2c1.7-2.9,3.3-6.1,4.7-9.7C75.2,91.8,77.2,84,78.6,75.4z"/>
                                    </g>
                                </g>
                            </svg>
                        </NavInlineButton> */}
                        {/* <NavInlineButton
                            onClick={() => handle3dButton(mapParams.use3d)}
                            isActive={mapParams.use3d}
                        >
                            <svg x="0px" y="0px" viewBox="0 0 100 100">
                                <g transform="translate(50 50) scale(0.69 0.69) rotate(0) translate(-50 -50)">
                                    <path d="M109,23.7c0-1-0.2-1.9-0.7-2.8c-0.1-0.2-0.3-0.4-0.5-0.7c-0.4-0.6-0.8-1.1-1.3-1.5l0,0L54.1-20.5c-2.3-1.7-5.5-1.7-7.9,0
                                        L-6.2,18.8l0,0c-0.5,0.4-1,0.9-1.3,1.5C-7.7,20.5-7.8,20.7-8,21c-0.6,0.8-0.9,1.8-1,2.8v52.5c0,0,0,0,0,0.5c0.2,1.7,1,3.3,2.2,4.5
                                        v0.3l52.5,39.3l0.9,0.5l0.7,0.4c1.5,0.6,3.2,0.6,4.7,0l0.7-0.4l0.9-0.5l52.5-39.3v-0.3c1.3-1.2,2.1-2.8,2.2-4.5c0,0,0,0,0-0.5
                                        L109,23.7z M4.1,36.8l39.3,29.5v36.1L4.1,72.9V36.8z M56.6,66.3l39.3-29.5v36.1l-39.3,29.5V66.3z M50-7.4l41.5,31.1L50,54.9
                                        L8.5,23.7L50-7.4z"/>
                                </g>
                            </svg>
                        </NavInlineButton> */}
                        <GeolocateControl
                            positionOptions={{enableHighAccuracy: false}}
                            trackUserLocation={false}
                            onGeolocate={viewState  => handleGeolocate(viewState)}
                            style={{marginBottom: 10}}
                        />
                        <NavigationControl
                            onViewportChange={viewState  => setViewState(viewState)} 
                        />
                    </div>
                    <div></div>
                </ReactMapGL >
                {hoverInfo.object && (
                <HoverDiv style={{position: 'absolute', zIndex: 1, pointerEvents: 'none', left: hoverInfo.x, top: hoverInfo.y}}>
                    <MapTooltipContent content={hoverInfo.object} />
                </HoverDiv>
                )}
            </DeckGL>
        </div>
    ) 
}

export default Map