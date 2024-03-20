import React, { useState, useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import LineString from 'ol/geom/LineString';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Icon, Style } from 'ol/style';
import pinImage from '../components/pin.png';
import { Draw } from 'ol/interaction';

const MapComponent: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [addMarker, setAddMarker] = useState(false);
    const [implementPolygonLogic, setImplementPolygonLogic] = useState(false);
    const [drawnFeatures, setDrawnFeatures] = useState<any[]>([]);
    const [markers, setMarkers] = useState<{ lon: number; lat: number }[]>([]);
    let map: Map | null = null;

    useEffect(() => {
        // Initialize map when the component mounts
        if (!mapRef.current) return;

        // Initialize OpenLayers map
        map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            view: new View({
                center: fromLonLat([77.026344, 28.457523]), // Gurugram's latitude and longitude
                zoom: 12,
            }),
        });

        // Add marker functionality
        if (addMarker) {
            const draw = new Draw({
                source: new VectorSource(),
                // type  points for mark pin point
                type: 'Point',
            });
            map.addInteraction(draw);
            draw.on('drawend', (event: any) => {
                const coordinate = event.feature.getGeometry().getCoordinates();
                // Convert coordinate to lon-lat
                const lonLat = toLonLat(coordinate);
                setMarkers(prevMarkers => [...prevMarkers, { lon: lonLat[0], lat: lonLat[1] }]);
                addMarkerToMap(event.feature);
            });
        }

        // Add polygon functionality
        if (implementPolygonLogic) {
            const draw = new Draw({
                source: new VectorSource(),
                // type polygons 
                type: 'Polygon',
            });
            map.addInteraction(draw);
            draw.on('drawend', (event: any) => {
                const polygonCoords = event.feature.getGeometry().getCoordinates()[0]; // Extract outer ring coordinates
                const polygonArea = calculatePolygonArea(polygonCoords);
                const polygonSidesLength = calculatePolygonSidesLength(polygonCoords);
                setDrawnFeatures(prevFeatures => [...prevFeatures, { type: 'Polygon', coords: polygonCoords, area: polygonArea, sidesLength: polygonSidesLength }]);
                addPolygonToMap(event.feature, polygonCoords);
            });
        }

        // Clean up function to dispose the map when the component unmounts
        return () => {
            if (map) {
                map.dispose();
            }
        };
    }, [addMarker, implementPolygonLogic]);

    // Function to calculate the area of a polygon
    const calculatePolygonArea = (coords: any) => {
        const polygon = new Polygon([coords]);
        const area = polygon.getArea();
        return area;
    };

    // Function to calculate the lengths of each side of a polygon
    const calculatePolygonSidesLength = (coords: any) => {
        const lineString = new LineString(coords);
        const coordinates = lineString.getCoordinates();
        const sidesLength: number[] = [];
        for (let i = 0; i < coordinates.length - 1; i++) {
            const sideLength = Math.sqrt(Math.pow(coordinates[i + 1][0] - coordinates[i][0], 2) + Math.pow(coordinates[i + 1][1] - coordinates[i][1], 2));
            sidesLength.push(sideLength);
        }
        return sidesLength;
    };

    // Function to add a polygon to the map
    const addPolygonToMap = (feature: any, polygonCoords: any) => {
        const vectorLayer = new VectorLayer({
            source: new VectorSource({
                features: [feature],
            }),
        });

        if (map) {
            map.addLayer(vectorLayer);
        }
    };

    // Function to add a marker to the map
    const addMarkerToMap = (feature: any) => {

        // style for marker 
        const markerStyle = new Style({
            image: new Icon({
                crossOrigin: 'anonymous',
                src: pinImage.src,
                scale: 0.05,
            }),
        });

        const vectorLayer = new VectorLayer({
            source: new VectorSource({
                features: [feature],
            }),
            style: markerStyle, // Apply marker style to the vector layer
        });

        if (map) {
            map.addLayer(vectorLayer);
        }
    };


    // Function to toggle the add marker functionality
    const toggleAddMarker = () => {
        setAddMarker(!addMarker);
    };

    // Function to toggle the implement polygon logic functionality
    const toggleImplementPolygonLogic = () => {
        setImplementPolygonLogic(!implementPolygonLogic);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2vw', marginTop: '2vw' }}>
                <label style={{ marginLeft: '5vw' }}>
                    Add Marker Logic:
                    <input type="checkbox" checked={addMarker} onChange={toggleAddMarker} />
                </label>
                <label style={{ marginRight: '10vw' }}>
                    Implement Polygon Logic:
                    <input type="checkbox" checked={implementPolygonLogic} onChange={toggleImplementPolygonLogic} />
                </label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                {markers.length > 0 && (
                    <div style={{ marginLeft: '5vw', marginBottom: '2vw' }}>
                        <h2>Added Markers:</h2>
                        <ol>
                            {markers.map((marker, index) => (
                                <li key={index}>{`Latitude: ${marker.lat}, Longitude: ${marker.lon}`}</li>
                            ))}
                        </ol>
                    </div>
                )}
                {drawnFeatures.length > 0 && (
                    <div style={{ marginRight: '10vw', marginBottom: '2vw' }}>
                        <h2>Drawn Polygon:</h2>
                        <ul >
                            {drawnFeatures.map((feature, index) => (
                                <li key={index} style={{ marginTop: '2vw' }}>
                                    Type: {feature.type} <br />
                                    Area: {feature.area} m<sup>2</sup><br />
                                    Side Lengths:<br />
                                    <ol>
                                        {feature.sidesLength.map((length: number, index: number) => (
                                            <li key={index}>{`Side ${index + 1}: ${length.toFixed(2)} m`}</li>
                                        ))}
                                    </ol>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div ref={mapRef} style={{ height: '70vh', marginBottom: '2vw' }} />
        </div>
    );
};

export default MapComponent;
