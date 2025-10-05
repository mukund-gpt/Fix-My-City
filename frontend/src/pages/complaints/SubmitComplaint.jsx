import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../api/axiosinstance";


import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY; 

const DEFAULT_LOCATION = { lat: 28.7041, lng: 77.1025 }; // fallback (Delhi) — stored as {lat,lng}

export default function SubmitComplaint() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  // Single source-of-truth for coordinates — avoids accidental swaps
  const [location, setLocation] = useState({ lat: null, lng: null });

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // --- File input ---
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // --- Geolocation: store into location state as (lat, lng) ---
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = Number(pos.coords.latitude);
        const longitude = Number(pos.coords.longitude);
        console.log("Geolocation ->", { latitude, longitude });
        // Keep state consistent: lat first, lng second
        setLocation({ lat: latitude, lng: longitude });
      },
      (err) => {
        console.error("geolocation error", err);
        alert("Unable to fetch location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // --- Initialize map once on mount ---
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    mapRef.current = new maptilersdk.Map({
      container: mapContainerRef.current,
      style: maptilersdk.MapStyle.STREETS,
      // MapTiler/Mapbox-style APIs expect [lng, lat]
      center: [DEFAULT_LOCATION.lng, DEFAULT_LOCATION.lat],
      zoom: 11,
    });

    mapRef.current.addControl(new maptilersdk.NavigationControl(), "top-left");
    console.log("Map initialized with center (lng,lat):", [
      DEFAULT_LOCATION.lng,
      DEFAULT_LOCATION.lat,
    ]);

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          /* ignore */
        }
        mapRef.current = null;
      }
    };
    // run once
  }, []);

  // --- Update or create marker when location changes ---
  useEffect(() => {
    if (!mapRef.current) return;
    const { lat, lng } = location;
    // only act when both coordinates are present
    if (lat == null || lng == null) return;

    // ALWAYS convert to [lng, lat] when giving coords to the map SDK
    const center = [Number(lng), Number(lat)];
    console.log("Update map/marker to (lng,lat):", center);

    if (!markerRef.current) {
      markerRef.current = new maptilersdk.Marker({ draggable: true })
        .setLngLat(center)
        .addTo(mapRef.current);

      // On dragend: read marker coordinates and update the single source-of-truth (location)
      markerRef.current.on("dragend", () => {
        const lngLat = markerRef.current.getLngLat();
        const newLat = Number(lngLat.lat);
        const newLng = Number(lngLat.lng);
        console.log("marker dragend ->", { newLat, newLng });
        // IMPORTANT: setLocation({ lat: newLat, lng: newLng })
        setLocation({ lat: newLat, lng: newLng });
      });
    } else {
      // move marker to new position
      markerRef.current.setLngLat(center);
    }

    try {
      mapRef.current.easeTo({ center, zoom: 15 });
    } catch (e) {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(15);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    console.log("Submitting complaint with location:", location);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (photo) formData.append("photo", photo);

    if (location.lat != null && location.lng != null) {
      formData.append("latitude", String(location.lat));
      formData.append("longitude", String(location.lng));
    }

    try {
      const res = await axiosInstance.post("/complaints", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("submit response", res?.data);
      alert("Complaint submitted!");
      // reset
      setTitle("");
      setDescription("");
      setPhoto(null);
      setPreview(null);
      setLocation({ lat: null, lng: null });
      // remove marker (optional)
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.setCenter([DEFAULT_LOCATION.lng, DEFAULT_LOCATION.lat]);
        mapRef.current.setZoom(11);
      }
    } catch (err) {
      console.error("submit error", err);
      alert("Error submitting complaint! See console for details.");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      mt={5}
      px={2}
    >
      <Card sx={{ maxWidth: 700, width: "100%", p: 2, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">
            Submit a Complaint
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Title"
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <TextField
                label="Description"
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                required
              />

              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
              >
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoChange}
                />
              </Button>

              {preview && (
                <Box
                  component="img"
                  src={preview}
                  alt="Preview"
                  sx={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 1,
                    border: "1px solid #ccc",
                  }}
                />
              )}

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleGetLocation}
                >
                  Get Current Location
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => {
                    setLocation({ lat: null, lng: null });
                    if (markerRef.current) {
                      markerRef.current.remove();
                      markerRef.current = null;
                    }
                    if (mapRef.current) {
                      mapRef.current.setCenter([
                        DEFAULT_LOCATION.lng,
                        DEFAULT_LOCATION.lat,
                      ]);
                      mapRef.current.setZoom(11);
                    }
                    console.log("Location reset to default");
                  }}
                >
                  Reset Location
                </Button>
              </Stack>

              <div
                ref={mapContainerRef}
                style={{
                  height: 320,
                  width: "100%",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  overflow: "hidden",
                }}
              />

              <Typography variant="body2" mt={1}>
                {location.lat != null && location.lng != null
                  ? `Latitude: ${Number(location.lat).toFixed(
                      6
                    )}, Longitude: ${Number(location.lng).toFixed(6)}`
                  : "No location selected yet"}
              </Typography>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ py: 1.5, fontWeight: "bold" }}
              >
                Submit
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
