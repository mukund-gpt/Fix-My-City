import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
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
import { toast } from 'react-hot-toast';
import { useSelector } from "react-redux";
import { useCreateComplaintMutation } from "../../redux/api/api";
maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

const DEFAULT_LOCATION = { lat: 28.7041, lng: 77.1025 }; // Delhi

export default function SubmitComplaint() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const token = useSelector((state) => state.auth.user?.token);
  const [createComplaint, { isLoading }] = useCreateComplaintMutation();
  
  if(!token){
    return <Typography variant="h6" color="error" align="center" mt={5}>
      You must be logged in to submit a complaint.
    </Typography>
  } 

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images total
    const remainingSlots = 5 - photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s). Maximum 5 images allowed.`);
    }

    setPhotos((prev) => [...prev, ...filesToAdd]);

    // Generate previews
    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to fetch location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new maptilersdk.Map({
      container: mapContainerRef.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [DEFAULT_LOCATION.lng, DEFAULT_LOCATION.lat], // [lng, lat]
      zoom: 11,
    });

    mapRef.current.addControl(new maptilersdk.NavigationControl(), "top-left");

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker when location changes
  useEffect(() => {
    if (!mapRef.current || location.lat == null || location.lng == null) return;

    const lngLat = [location.lng, location.lat]; // [lng, lat] for MapTiler

    if (!markerRef.current) {
      markerRef.current = new maptilersdk.Marker({ draggable: true })
        .setLngLat(lngLat)
        .addTo(mapRef.current);

      markerRef.current.on("dragend", () => {
        const { lat, lng } = markerRef.current.getLngLat();
        setLocation({ lat, lng });
      });
    } else {
      markerRef.current.setLngLat(lngLat);
    }

    mapRef.current.easeTo({ center: lngLat, zoom: 15 });
  }, [location]);

  // Add click handler to place marker on map
  useEffect(() => {
    if (!mapRef.current) return;

    const handleMapClick = (e) => {
      const { lng, lat } = e.lngLat;
      setLocation({ lat, lng });
    };

    mapRef.current.on("click", handleMapClick);

    return () => {
      if (mapRef.current) {
        mapRef.current.off("click", handleMapClick);
      }
    };
  }, []);

  const resetLocation = () => {
    setLocation({ lat: null, lng: null });
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (mapRef.current) {
      mapRef.current.easeTo({
        center: [DEFAULT_LOCATION.lng, DEFAULT_LOCATION.lat],
        zoom: 11,
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPhotos([]);
    setPreviews([]);
    resetLocation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || photos.length === 0) {
      alert("Please fill all fields and upload at least one photo.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    
    // Append multiple photos
    photos.forEach((photo) => {
      formData.append("photos", photo);
    });
    
    if (location.lat != null && location.lng != null) {
      formData.append("latitude", String(location.lat));
      formData.append("longitude", String(location.lng));
    }

    try {
      // const res = await axiosInstance.post("/complaints", formData, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      await createComplaint({ data: formData, token }).unwrap();
      toast.success("Complaint submitted successfully!");
      resetForm();
      
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err?.data?.message || "Failed to submit complaint. Please try again.");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" mt={5} px={2}>
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
                disabled={photos.length >= 5}
              >
                Upload Images ({photos.length}/5)
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  multiple
                  onChange={handlePhotoChange}
                />
              </Button>

              {previews.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: 2,
                  }}
                >
                  {previews.map((preview, index) => (
                    <Box key={index} sx={{ position: "relative" }}>
                      <Box
                        component="img"
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: 150,
                          objectFit: "cover",
                          borderRadius: 1,
                          border: "1px solid #ccc",
                        }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleRemovePhoto(index)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          minWidth: "auto",
                          px: 1,
                          py: 0.5,
                        }}
                      >
                        ✕
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleGetLocation}
                >
                  Get Current Location
                </Button>

                <Button variant="outlined" onClick={resetLocation}>
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
                  cursor: "pointer",
                }}
              />

              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                💡 Click anywhere on the map to place a marker, or drag the marker to adjust location
              </Typography>

              <Typography variant="body2">
                {location.lat != null && location.lng != null
                  ? `Latitude: ${location.lat.toFixed(6)}, Longitude: ${location.lng.toFixed(6)}`
                  : "No location selected"}
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
