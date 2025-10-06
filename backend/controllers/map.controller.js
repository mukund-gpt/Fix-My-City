import Complaint from "../models/Complaint.js";

export const getLocations = async (req, res) => {
  try {
    // Fetch all complaints with necessary fields
    const complaints = await Complaint.find({
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    }).select('latitude longitude status title location');

    // Separate complaints by status
    const openComplaints = [];
    const inProgressComplaints = [];
    const resolvedComplaints = [];

    complaints.forEach(complaint => {
      const locationData = {
        id: complaint._id,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        title: complaint.title,
        location: complaint.location,
        status: complaint.status
      };

      switch (complaint.status) {
        case "OPEN":
          openComplaints.push(locationData);
          break;
        case "IN_PROGRESS":
          inProgressComplaints.push(locationData);
          break;
        case "RESOLVED":
          resolvedComplaints.push(locationData);
          break;
        default:
          break;
      }
    });

    return res.status(200).json({
      success: true,
      message: "Locations fetched successfully",
      data: {
        open: openComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints,
        summary: {
          total: complaints.length,
          openCount: openComplaints.length,
          inProgressCount: inProgressComplaints.length,
          resolvedCount: resolvedComplaints.length
        }
      }
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
      error: error.message
    });
  }
};