import axiosInstance from "@/api/axiosinstance";
import { Map, MapStyle, config, Popup } from "@maptiler/sdk";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function MapComponent() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [locations, setLocations] = useState(null);
  const [summary, setSummary] = useState(null);

  // 🔹 Fetch locations from backend
  const fetchLocations = async () => {
    try {
      const response = await axiosInstance.get("/map/getLocations");
      if (response.data.success) {
        const { open, inProgress, resolved, summary } = response.data.data;
        const allLocations = [
          ...open.map((loc) => ({ ...loc, status: "OPEN" })),
          ...inProgress.map((loc) => ({ ...loc, status: "IN_PROGRESS" })),
          ...resolved.map((loc) => ({ ...loc, status: "RESOLVED" })),
        ];
        setLocations(allLocations);
        setSummary(summary);
      } else toast.error("Failed to fetch locations");
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Error loading locations");
    }
  };

  // 🔹 Convert locations → GeoJSON
  const createGeoJSON = (locations) => ({
    type: "FeatureCollection",
    features: locations.map((loc) => ({
      type: "Feature",
      properties: {
        id: loc.id,
        title: loc.title,
        status: loc.status,
      },
      geometry: {
        type: "Point",
        coordinates: [loc.longitude, loc.latitude],
      },
    })),
  });

  // 🔹 Initialize MapTiler map
  useEffect(() => {
    config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

    if (map.current) return;

    map.current = new Map({
      container: mapContainer.current,
      zoom: 4,
      center: [78.9629, 20.5937],
      style: MapStyle.STREETS, // ✅ use stable style
    });

    map.current.once("load", () => {
      fetchLocations();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // 🔹 Add markers after data fetch
  useEffect(() => {
    if (!locations || !map.current) return;

    const mapObj = map.current;
    const sourceId = "complaint_source";
    const layerId = "complaint_points";

    // Wait for style load before adding
    if (!mapObj.isStyleLoaded()) {
      mapObj.once("load", () => {
        addOrUpdateData();
      });
    } else {
      addOrUpdateData();
    }

    function addOrUpdateData() {
      // Remove old layer/source if they exist
      if (mapObj.getLayer(layerId)) mapObj.removeLayer(layerId);
      if (mapObj.getSource(sourceId)) mapObj.removeSource(sourceId);

      mapObj.addSource(sourceId, {
        type: "geojson",
        data: createGeoJSON(locations),
      });

      mapObj.addLayer({
        id: layerId,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": 6,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
          "circle-color": [
            "match",
            ["get", "status"],
            "OPEN",
            "#ff4d4d",
            "IN_PROGRESS",
            "#ffcc00",
            "RESOLVED",
            "#00cc66",
            "#cccccc",
          ],
        },
      });

      // Add popup
      mapObj.on("click", layerId, (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { title, status } = e.features[0].properties;

        new Popup()
          .setLngLat(coordinates)
          .setHTML(
            `<div style="font-size:14px">
              <strong>${title}</strong><br/>
              Status: <b>${status}</b>
            </div>`
          )
          .addTo(mapObj);
      });

      mapObj.on("mouseenter", layerId, () => {
        mapObj.getCanvas().style.cursor = "pointer";
      });
      mapObj.on("mouseleave", layerId, () => {
        mapObj.getCanvas().style.cursor = "";
      });
    }

    return () => {
      if (mapObj.getLayer(layerId)) mapObj.removeLayer(layerId);
      if (mapObj.getSource(sourceId)) mapObj.removeSource(sourceId);
    };
  }, [locations]);

  return (
    <div className="w-full h-screen relative">
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full" />

      {/* Summary Panel */}
      <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-80 text-white p-4 rounded-lg shadow-lg max-w-xs space-y-2">
        <h2 className="text-lg font-bold">Complaint Summary</h2>
        <p className="text-xs text-gray-400">
          Marker colors represent complaint status.
        </p>
        {summary && (
          <ul className="text-xs mt-2 space-y-1">
            <li>
              <span className="text-red-400">●</span> Open: {summary.openCount}
            </li>
            <li>
              <span className="text-yellow-400">●</span> In Progress:{" "}
              {summary.inProgressCount}
            </li>
            <li>
              <span className="text-green-400">●</span> Resolved:{" "}
              {summary.resolvedCount}
            </li>
            <li>
              <span className="text-gray-400">●</span> Total: {summary.total}
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
