import RefreshIcon from "@mui/icons-material/Refresh"; // New: Reset Icon
import SearchIcon from "@mui/icons-material/Search"; // New: Search Icon
import {
  Box,
  Button,
  Card,
  CardContent, // New: For visual separation
  CircularProgress, // New: For elevation/style on the filter bar
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react"; // Added useEffect
import axiosInstance from "../api/axiosinstance";
import samplemessage from "../constants/sampleData.js";

// --- Constants for better maintenance ---
const URGENCY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];
const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED"];
const INITIAL_FILTERS = {
    urgency: "", // Default to All
    location: "",
    status: "", // Default to All
    startDate: "",
    endDate: "",
};
// ------------------------------------------

const FilterComplaints = () => {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Fallback: Populate with sample data initially (if the API call fails or is not ready)
    useEffect(() => {
        // Use a subset of sample data for initial display
        const initialSample = samplemessage.samplemessage.slice(0, 3).map((c, index) => ({
            ...c,
            // Ensure unique ID for list rendering
            id: c.id || index.toString(), 
        }));
        setComplaints(initialSample);
    }, []);


    // --- API Call Function ---
    const fetchComplaints = async (currentFilters) => {
        setLoading(true);
        try {
            // Remove empty/default values from the query
            const activeFilters = Object.fromEntries(
                Object.entries(currentFilters).filter(([_, v]) => v !== "" && v !== "All urgency")
            );
            
            const query = new URLSearchParams(activeFilters).toString();
            // Perform the API call with the constructed query
            const { data } = await axiosInstance.get(`/complaints?${query}`);
            
            setComplaints(data.map((c) => ({ 
                ...c, 
                // Normalize ID field
                id: c._id || c.id || Math.random().toString(), 
            })));

            // --- Set Default/Initial Values based on API Response (Optional) ---
            // If the API returns a suggested default urgency/status, you'd set it here.
            // For now, we'll keep the filters as they were, since the user explicitly set them.
            
        } catch (error) {
            console.error("Error fetching complaints:", error);
            // Optionally clear complaints or show an error state
            setComplaints([]); 
        } finally {
            setLoading(false);
        }
    };
    
    // --- Initial Load Effect ---
    useEffect(() => {
        // Fetch complaints with initial, empty filters on mount
        fetchComplaints(INITIAL_FILTERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    // --- Handlers ---
    const handleChange = (field, value) => {
        setFilters({ ...filters, [field]: value });
    };

    const handleSearch = () => {
        fetchComplaints(filters);
    };

    const handleClear = () => {
        setFilters(INITIAL_FILTERS);
        fetchComplaints(INITIAL_FILTERS); // Refetch all complaints
    };
    
    // --- Helper for Card Styling ---
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case "HIGH": return { borderColor: '#d32f2f', color: '#d32f2f' }; // Red
            case "MEDIUM": return { borderColor: '#ff9800', color: '#ff9800' }; // Orange
            case "LOW": return { borderColor: '#4caf50', color: '#4caf50' }; // Green
            default: return { borderColor: '#bdbdbd', color: '#424242' }; // Gray
        }
    };


    return (
        <Box sx={{ p: 4, width: "100%" }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                📢 Complaint Dashboard
            </Typography>

            {/* Filter Bar - Enhanced with Paper for elevation */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                    Select Filters
                </Typography>
                <Grid container spacing={3} alignItems="center">
                    
                    {/* Urgency */}
                    <Grid item xs={12} sm={6} md={2.5}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Urgency</InputLabel>
                            <Select
                                value={filters.urgency}
                                label="Urgency"
                                onChange={(e) => handleChange("urgency", e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                {URGENCY_OPTIONS.map(u => (
                                    <MenuItem key={u} value={u}>{u.replace('_', ' ')}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Location */}
                    <Grid item xs={12} sm={6} md={2.5}>
                        <TextField
                            label="Location"
                            fullWidth
                            size="small"
                            value={filters.location}
                            onChange={(e) => handleChange("location", e.target.value)}
                        />
                    </Grid>

                    {/* Status */}
                    <Grid item xs={12} sm={6} md={2.5}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filters.status}
                                label="Status"
                                onChange={(e) => handleChange("status", e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                {STATUS_OPTIONS.map(s => (
                                    <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Date Pickers */}
                    <Grid item xs={12} sm={6} md={2.5}>
                        <TextField
                            type="date"
                            label="Start Date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={filters.startDate}
                            onChange={(e) => handleChange("startDate", e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.5}>
                        <TextField
                            type="date"
                            label="End Date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={filters.endDate}
                            onChange={(e) => handleChange("endDate", e.target.value)}
                        />
                    </Grid>

                    {/* Search & Clear Buttons */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={handleSearch}
                                startIcon={<SearchIcon />}
                                disabled={loading}
                            >
                                Search
                            </Button>
                <Button
                  className="w-40"
                                variant="outlined"
                                color="secondary"
                                onClick={handleClear}
                                startIcon={<RefreshIcon />}
                                disabled={loading}
                            >
                                Clear
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Divider sx={{ mb: 4 }} />

            {/* Complaint List */}
            <Typography variant="h6" gutterBottom>
                {loading ? "Loading Results..." : `Found ${complaints.length} Complaints`}
            </Typography>
            
            <Grid container spacing={3}>
                {loading ? (
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress />
                    </Grid>
                ) : complaints.length === 0 ? (
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" color="textSecondary" align="center" sx={{ p: 4 }}>
                            No complaints found matching your criteria.
                        </Typography>
                    </Grid>
                ) : (
                    complaints.map((c) => {
                        const { borderColor, color } = getUrgencyColor(c.urgency);
                        return (
                            <Grid item xs={12} sm={6} lg={4} key={c.id}>
                                <Card 
                                    sx={{ 
                                        width: "100%", 
                                        borderLeft: `5px solid ${borderColor}`, // Highlight urgency
                                        transition: '0.3s',
                                        '&:hover': {
                                            boxShadow: 6, // Lift card on hover
                                        }
                                    }}
                                >
                                    <CardContent>
                                        <Typography 
                                            variant="h6" 
                                            gutterBottom 
                                            sx={{ color: color, fontWeight: 700 }}
                                        >
                                            {c.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                                            {c.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight="bold">
                                                Status: <span style={{ color: c.status === "RESOLVED" ? '#4caf50' : '#2196f3' }}>{c.status}</span>
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                Location: {c?.location || "N/A"}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Created: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "N/A"}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })
                )}
            </Grid>
        </Box>
    );
};

export default FilterComplaints;