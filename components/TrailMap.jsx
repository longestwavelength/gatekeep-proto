"use client";

import { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

let L;
let MapContainer;
let TileLayer;
let FeatureGroup;
let EditControl;
let useMap;
let Polyline;

if (typeof window !== 'undefined') {
  L = require('leaflet');
  require('leaflet-draw');
  const ReactLeaflet = require('react-leaflet');
  MapContainer = ReactLeaflet.MapContainer;
  TileLayer = ReactLeaflet.TileLayer;
  FeatureGroup = ReactLeaflet.FeatureGroup;
  useMap = ReactLeaflet.useMap;
  Polyline = ReactLeaflet.Polyline;
  EditControl = require('react-leaflet-draw').EditControl;

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

const MapEventHandler = ({ onMapInit, featureGroupRef, onPathChange, existingPath, readOnly }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      console.log("Map initialized successfully.");
      onMapInit(map);

      if(!readOnly) {
       
      }
      const handleDrawCreated = (e) => {
        try {
          const { layerType, layer } = e;
          console.log(`Layer type: ${layerType}`);

          if (layerType === 'polyline') {
            featureGroupRef.current.clearLayers();
            featureGroupRef.current.addLayer(layer);

            const latLngs = layer.getLatLngs();
            const coordinates = latLngs.map(latlng => [latlng.lng, latlng.lat]);
            
            if (coordinates.length > 0) {
              const pathObject = {
                type: 'LineString',
                coordinates: coordinates
              };
              console.log('Sending path object:', pathObject);
              onPathChange(pathObject);
            } else {
              console.warn("No coordinates captured.");
              alert("It seems the path hasn't been captured. Please try again.");
            }
          } else {
            console.warn(`Unhandled layer type: ${layerType}`);
            alert("Please draw a path using the polyline tool.");
          }
        } catch (error) {
          console.error('Error in draw created handler:', error);
        }
      };

      

      map.on('draw:created', handleDrawCreated);

      // Display existing path if available
      if (existingPath && existingPath.coordinates && existingPath.coordinates.length > 0) {
        const latLngs = existingPath.coordinates.map(coord => [coord[1], coord[0]]);
        const polyline = L.polyline(latLngs, { color: 'blue' });
        featureGroupRef.current.addLayer(polyline);
        map.fitBounds(polyline.getBounds());
      }

      return () => {
        if (!readOnly) {
          map.off('draw:created', handleDrawCreated);
        }
      };
    }
  }, [map, onPathChange, existingPath]);

  return null;
};

const TrailMap = ({ onPathChange, existingPath, readOnly = false }) => {
  const [map, setMap] = useState(null);
  const featureGroupRef = useRef();

  if (typeof window === 'undefined') return null;

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <MapEventHandler 
          onMapInit={setMap}
          featureGroupRef={featureGroupRef}
          onPathChange={onPathChange}
          existingPath={existingPath}
          readOnly={readOnly}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FeatureGroup ref={featureGroupRef}>
        {!readOnly && (
            <EditControl
              position="topright"
              draw={{
                polyline: true,
                rectangle: false,
                circle: false,
                marker: false,
                circlemarker: false,
                polygon: false
              }}
              edit={{
                edit: true,
                remove: true
              }}
            />
          )}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default TrailMap;


/** 
"use client";

import { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

let L;
let MapContainer;
let TileLayer;
let FeatureGroup;
let EditControl;
let useMap;

if (typeof window !== 'undefined') {
  L = require('leaflet');
  require('leaflet-draw');
  const ReactLeaflet = require('react-leaflet');
  MapContainer = ReactLeaflet.MapContainer;
  TileLayer = ReactLeaflet.TileLayer;
  FeatureGroup = ReactLeaflet.FeatureGroup;
  useMap = ReactLeaflet.useMap;
  EditControl = require('react-leaflet-draw').EditControl;

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// This is a new component that will handle the map events
const MapEventHandler = ({ onMapInit, featureGroupRef, onPathChange }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      console.log("Map initialized successfully.");
      onMapInit(map);

      const handleDrawCreated = (e) => {
        try {
          const { layerType, layer } = e;
          console.log(`Layer type: ${layerType}`);

          if (layerType === 'polyline') {
            featureGroupRef.current.clearLayers();
            featureGroupRef.current.addLayer(layer);

            const latLngs = layer.getLatLngs();
            const coordinates = latLngs.map(latlng => [latlng.lng, latlng.lat]);
            
            if (coordinates.length > 0) {
              const pathObject = {
                type: 'LineString',
                coordinates: coordinates
              };
              console.log('Sending path object:', pathObject);
              onPathChange(pathObject);
            } else {
              console.warn("No coordinates captured.");
              alert("It seems the path hasn't been captured. Please try again.");
            }
          } else {
            console.warn(`Unhandled layer type: ${layerType}`);
            alert("Please draw a path using the polyline tool.");
          }
        } catch (error) {
          console.error('Error in draw created handler:', error);
        }
      };

      map.on('draw:created', handleDrawCreated);

      return () => {
        map.off('draw:created', handleDrawCreated);
      };
    }
  }, [map, onPathChange]);

  return null;
};

const TrailMap = ({ onPathChange }) => {
  const [map, setMap] = useState(null);
  const featureGroupRef = useRef();

  if (typeof window === 'undefined') return null;

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <MapEventHandler 
          onMapInit={setMap}
          featureGroupRef={featureGroupRef}
          onPathChange={onPathChange}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            draw={{
              polyline: true,
              rectangle: false,
              circle: false,
              marker: false,
              circlemarker: false,
              polygon: false
            }}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default TrailMap;
*/