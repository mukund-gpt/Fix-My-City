import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
// New Icons for better visual appeal
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton, // Added for loading state in the form
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ClosedCaptionIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useCreateComplaintMutation } from "../../redux/api/api";
maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

// Define a richer default style and location
const DEFAULT_LOCATION = { lat: 28.7041, lng: 77.1025 }; // Delhi
const MAP_STYLE = maptilersdk.MapStyle.STREETS; // Keeping it simple, but could be 'STREETS_V2' or similar

export default function SubmitComplaint() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const token = useSelector((state) => state.auth.user?.token);
  const [createComplaint, { isLoading }] = useCreateComplaintMutation();

  if (!token) {
    return (
      <Typography variant="h5" color="error" align="center" mt={5} p={3}>
        🛑 Access Denied: Please log in to submit a complaint.
      </Typography>
    );
  }

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // --- Photo Handlers ---
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 5 - photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast.error(
        `You can only upload ${remainingSlots} more image(s). Maximum 5 images allowed.`
      );
    }

    // Add actual file objects
    setPhotos((prev) => [...prev, ...filesToAdd]);

    // Generate previews
    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input value to allow re-uploading the same file if needed
    e.target.value = null;
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Geolocation Handlers ---
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser.");
      return;
    }

    // Indicate loading while fetching location
    toast.loading("Fetching your current location...", {
      id: "location-fetch",
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        toast.success("Location found!", { id: "location-fetch" });
      },
      (err) => {
        console.error("Geolocation error:", err);
        toast.error(err.message, { id: "location-fetch" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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
    toast("Location reset to default map view.", { icon: "📍" });
  };

  // --- Map Effects (Unchanged Core Logic) ---
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new maptilersdk.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: [DEFAULT_LOCATION.lng, DEFAULT_LOCATION.lat], // [lng, lat]
      zoom: 11,
    });

    mapRef.current.addControl(
      new maptilersdk.NavigationControl({ visual: false }),
      "top-left"
    );

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const lngLat = [location.lng, location.lat]; // [lng, lat]

    if (location.lat != null && location.lng != null) {
      if (!markerRef.current) {
        markerRef.current = new maptilersdk.Marker({
          draggable: true,
          color: "#ff4444",
        })
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
    } else {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [location]);

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

  // --- Form Handlers ---
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPhotos([]);
    setPreviews([]);
    resetLocation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || photos.length === 0) {
      toast.error(
        "Please provide a title, description, and at least one photo."
      );
      return;
    }

    if (location.lat == null || location.lng == null) {
      toast.error("Please select the complaint location on the map.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());

    photos.forEach((photo) => {
      formData.append("photos", photo);
    });

    formData.append("latitude", String(location.lat));
    formData.append("longitude", String(location.lng));

    try {
      const res = await createComplaint({ data: formData, token });
      if (res.error) {
        // Handle RTK Query errors
        throw new Error(
          res.error?.data?.message || "Failed to submit complaint"
        );
      }
      console.log(res);

      toast.success(res?.data?.message);
      resetForm();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.message || "Failed to submit complaint");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      mt={5}
      mb={5}
      px={2}
      className="bg-gray-800" // Light background for contrast
    >
      <Card
        sx={{
          maxWidth: 800,
          width: "100%",
          p: 4,
          boxShadow: 10,
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            gutterBottom
            align="center"
            color="primary"
            sx={{ fontWeight: 700, mb: 4 }}
          >
            Report an Issue
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              {/* Title and Description */}
              <TextField
                label="Complaint Title (e.g., Broken Streetlight on Main St.)"
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />

              <TextField
                label="Detailed Description of the Problem"
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={5}
                fullWidth
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />

              {/* --- Photo Upload Section --- */}
              <Box sx={{ border: "1px dashed #bdbdbd", p: 2, borderRadius: 2 }}>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                  disabled={photos.length >= 5 || isLoading}
                  color="secondary"
                  sx={{ mb: 2, fontWeight: "bold" }}
                >
                  Upload Supporting Photos ({photos.length}/5)
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    multiple
                    onChange={handlePhotoChange}
                  />
                </Button>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  Maximum 5 images allowed. Photos help us understand the issue
                  better.
                </Typography>

                {previews.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    {previews.map((preview, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: "relative",
                          width: 150,
                          height: 100,
                        }}
                      >
                        <Box
                          component="img"
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 1,
                            border: "2px solid #5c6bc0", // Primary border
                          }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemovePhoto(index)}
                          sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            backgroundColor: "white",
                            border: "1px solid #f44336",
                            "&:hover": { backgroundColor: "#ffebee" },
                          }}
                        >
                          <ClosedCaptionIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              {/* --- Location Section --- */}

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
              >
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleGetLocation}
                  startIcon={<GpsFixedIcon />}
                  sx={{ flexGrow: 1 }}
                >
                  Use GPS (My Current Location)
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={resetLocation}
                  startIcon={<DeleteForeverIcon />}
                >
                  Reset Map Location
                </Button>
              </Stack>

              <Box
                ref={mapContainerRef}
                sx={{
                  height: 400, // Increased height for better view
                  width: "100%",
                  position: "relative",
                  borderRadius: 2,
                  border: `2px solid ${
                    location.lat != null ? "#1976d2" : "#ddd"
                  }`,
                  overflow: "hidden",
                  cursor: "crosshair",
                  transition: "border 0.3s",
                }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic", textAlign: "center" }}
              >
                <b>Tip: </b> Click on the map to place the marker, or drag the
                red marker to precisely locate the issue.
              </Typography>

              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: location.lat != null ? "#e8f5e9" : "#fff3e0",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  color: location.lat != null ? "#1b5e20" : "#ff9800",
                }}
              >
                <LocationOnIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  {location.lat != null && location.lng != null
                    ? `Selected Coordinates: Lat ${location.lat.toFixed(
                        6
                      )}, Lng ${location.lng.toFixed(6)}`
                    : "Status: Location not yet pinned."}
                </Typography>
              </Box>

              {/* --- Submit Button --- */}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SendIcon />
                  )
                }
                disabled={isLoading}
                sx={{
                  py: 1.8,
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  borderRadius: 2,
                }}
              >
                {isLoading ? "Submitting..." : "Submit Complaint"}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
