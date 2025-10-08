import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import axiosInstance from "../api/axiosinstance";
import samplemessage from "../constants/sampleData";

const FilterComplaints = () => {
  const [filters, setFilters] = useState({
    urgency: "",
    location: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [complaints, setComplaints] = useState(
    samplemessage.samplemessage.slice(0, 3).map((c, index) => ({
      ...c,
      id: c.id || index,
    }))
  );

  const handleChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSearch = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const { data } = await axiosInstance.get(`/api/complaints?${query}`);
      setComplaints(data.map((c) => ({ ...c, id: c._id || c.id })));
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  return (
    <Box sx={{ p: 4, width: "100%" }}>
      <Typography variant="h5" gutterBottom>
        Filter Complaints
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        {/* Urgency */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel >Urgency</InputLabel>
            <Select
              value={filters.urgency}
              label="Urgency"
              onChange={(e) => handleChange("urgency", e.target.value)}
            >
              <MenuItem value="All urgency">All</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Location */}
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            label="Location"
            fullWidth
            value={filters.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />
        </Grid>

        {/* Status */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="OPEN">Open</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="RESOLVED">Resolved</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Start Date */}
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            type="date"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={filters.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
          />
        </Grid>

        {/* End Date */}
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            type="date"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={filters.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
          />
        </Grid>

        {/* Search Button */}
        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ height: "56px" }}
            onClick={handleSearch}
          >
            Search
          </Button>
        </Grid>
      </Grid>

      {/* Complaint List */}
      <Grid container spacing={2}>
        {complaints.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.id}>
            <Card variant="outlined" sx={{ width: "100%" }}>
              <CardContent>
                <Typography variant="h6">{c.title}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {c.description}
                </Typography>
                <Typography variant="body2">
                  <strong>Urgency:</strong> {c?.urgency} | <strong>Status:</strong> {c.status}
                </Typography>
                <Typography variant="body2">
                  <strong>Location:</strong> {c?.location}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Created At: {c.createdAt ? new Date(c.createdAt).toLocaleString() : "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FilterComplaints;
