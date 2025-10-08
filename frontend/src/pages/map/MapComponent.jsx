import { Map, MapStyle, config } from '@maptiler/sdk';
import { useEffect, useRef } from 'react';


const sampleLocations = [
  { lng: 77.2090, lat: 28.6139, students: 3500 }, // Delhi, India
  { lng: 72.8777, lat: 19.0760, students: 4200 }, // Mumbai, India
  { lng: 77.5946, lat: 12.9716, students: 3800 }, // Bangalore, India
  { lng: 80.2707, lat: 13.0827, students: 3200 }, // Chennai, India
  { lng: 88.3639, lat: 22.5726, students: 4000 }, // Kolkata, India
  { lng: 78.4867, lat: 17.3850, students: 2900 }, // Hyderabad, India
  { lng: 73.8567, lat: 18.5204, students: 2100 }, // Pune, India
  { lng: 72.5714, lat: 23.0225, students: 2800 }, // Ahmedabad, India
  { lng: 75.7873, lat: 26.9124, students: 1900 }, // Jaipur, India
  { lng: 76.7794, lat: 30.7333, students: 2300 }, // Chandigarh, India
  { lng: 85.8245, lat: 20.2961, students: 1800 }, // Bhubaneswar, India
  { lng: 74.7973, lat: 34.0837, students: 1500 }, // Srinagar, India
  { lng: 91.8933, lat: 26.1445, students: 1400 }, // Guwahati, India
  { lng: 75.3412, lat: 19.8762, students: 1600 }, // Aurangabad, India
  { lng: 82.9739, lat: 25.3176, students: 2200 }, // Allahabad, India
];

// Convert sample locations to GeoJSON format
const createGeoJSON = (locations) => {
  return {
    type: 'FeatureCollection',
    features: locations.map((loc, index) => ({
      type: 'Feature',
      properties: {
        students: loc.students,
        id: index
      },
      geometry: {
        type: 'Point',
        coordinates: [loc.lng, loc.lat]
      }
    }))
  };
};

export default function MapComponent() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    // Set your MapTiler API key
    config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

    if (map.current) return; 

   
    map.current = new Map({
      container: mapContainer.current,
      zoom: 4,
      center: [78.9629, 20.5937], 
      style: MapStyle.DATAVIZ.DARK
    });

    map.current.on('load', function () {
      
      map.current.addSource('school_source', {
        type: 'geojson',
        data: createGeoJSON(sampleLocations)
      });

      
      map.current.addLayer({
        id: 'school_heat',
        type: 'heatmap',
        source: 'school_source',
        maxzoom: 14,
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'students'],
            0,
            0,
            20000,
            1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            1,
            12,
            3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(68, 1, 84, 0)',
            0.01, 'rgba(68, 1, 84, 0.2)',
            0.13, 'rgba(71, 44, 122, 1)',
            0.25, 'rgba(59, 81, 139, 1)',
            0.38, 'rgba(44, 113, 142, 1)',
            0.5, 'rgba(33, 144, 141, 1)',
            0.63, 'rgba(39, 173, 129, 1)',
            0.75, 'rgba(92, 200, 99, 1)',
            0.88, 'rgba(170, 220, 50, 1)',
            1, 'rgba(253, 231, 37, 1)',
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            2,
            9,
            20
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7,
            1,
            18,
            0
          ]
        }
      });

      
      map.current.addLayer({
        id: 'school_point',
        type: 'circle',
        source: 'school_source',
        minzoom: 8,
        paint: {
          'circle-pitch-alignment': 'map',
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9,
            ['interpolate', ['linear'], ['get', 'students'], 10, 0.1 * 5, 4000, 2 * 2.5],
            16,
            ['interpolate', ['linear'], ['get', 'students'], 10, 1 * 5, 4000, 20 * 2.5]
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'students'],
            0, 'rgba(68, 1, 84, 0)',
            20, 'rgba(68, 1, 84, 20)',
            260, 'rgba(71, 44, 122, 100)',
            500, 'rgba(59, 81, 139, 100)',
            760, 'rgba(44, 113, 142, 100)',
            1000, 'rgba(33, 144, 141, 100)',
            1260, 'rgba(39, 173, 129, 100)',
            1500, 'rgba(92, 200, 99, 100)',
            1760, 'rgba(170, 220, 50, 100)',
            2000, 'rgba(253, 231, 37, 100)',
          ],
          'circle-stroke-width': 0,
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8,
            0,
            12,
            0.8
          ]
        }
      });
    });

  
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-screen relative">
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full" />
      <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-80 text-white p-4 rounded-lg shadow-lg max-w-xs">
        <h2 className="text-lg font-bold mb-2">Locations Heatmap</h2>
        <p className="text-xs text-gray-400">
          Zoom in to see individual points. Heatmap intensity based.
        </p>
      </div>
    </div>
  );
}