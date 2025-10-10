import axios from "axios";
import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
import cloudinary from "../utills/cloudinary.js";
import { notifyCreateComplaint } from "../utills/emails.js";
import { broadcastDashboardUpdate } from "../utills/socket.js";

export const createComplaint = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // console.log("Files received:", req.files);
    // console.log("Body:", req.body);
    const { title, description, latitude, longitude } = req.body;

    const flaskURL = `${process.env.FLASK_SERVER}/api/check-duplicate`; 
        const duplicateResponse = await axios.post(flaskURL, {
          target: {
            title,
            description,
            latitude,
            longitude,
            created_at: new Date().toISOString()
          }
        });
        console.log(duplicateResponse);
        
        if (duplicateResponse) {
          console.log('duplicate comment found');
          
          res.status(200).json({
            message:"similar complaint is alredy registered"
          })
        }
    let photoUrls = [];

    // Upload each image to Cloudinary in the "fixmycity" folder
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "fixmycity",
        });
        photoUrls.push(result.secure_url); // Store the Cloudinary URL
      }
    }

    const complaint = new Complaint({
      citizen: req.user.id,
      title,
      description,
      latitude,
      longitude,
      photos: photoUrls,
      status: "OPEN",
      assignedTo: null,
    });

    

    const createdComplaint = await complaint.save();
    await broadcastDashboardUpdate();// live stat update
    const citizen = await User.findById(req.user.id);
    notifyCreateComplaint(citizen.name, citizen.email, title);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("citizen", "name email") // Populate citizen details
      .populate("assignedTo", "name email") // Populate assigned staff details
      .limit(6);
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateComplaintByStaff = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    const { status, assignedTo } = req.body;
    if (status) complaint.status = status;
    if (assignedTo) complaint.assignedTo = assignedTo;

    const updatedComplaint = await complaint.save();
    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getmyComplaints = async (req, res) => {
  // console.log('user in get complaints');
  try {
    console.log("user in get complaints", req.user);
    const complaints = await Complaint.find({ citizen: req.user.id }).populate(
      "citizen",
      "name email"
    );
    // console.log("complaints", complaints);

    res.json(complaints);
  } catch (error) {
    res.status(502).json({ message: error.message });
  }
};
export const getComplaintsById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("citizen", "name email")
      .populate("assignedTo", "name email")
      .populate({
        path: "commentList",                      // Populate comments
        populate: { path: "author", select: "name email" } // Populate comment authors
      })
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//admin
export const getUnresolvedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      status: { $ne: "RESOLVED" },
    }).sort({ createdAt: -1 }); // Sort by newest first

    console.log(complaints);

    res.status(200).json(complaints);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getResolvedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      status: { $eq: "RESOLVED" },
    }).sort({ createdAt: -1 }); // Sort by newest first

    console.log(complaints);

    res.status(200).json(complaints);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

//staff
export const viewAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      assignedTo: { $in: [req.user.id] },
    });
    console.log(complaints);
    res.status(200).json(complaints);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getFilteredComplaints = async (req, res) => {
  try {
    let { urgency, location, status, startDate, endDate } = req.query;

    const filter = {};
    if (urgency) filter.urgency = urgency;
    if (location) filter.location = location;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const complaints = await Complaint.find(filter)
      .populate("citizen", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
};


export const getComplaintSlaTimeline = async (req, res) => {
  try {
    const complaintId = req.params.id;
    console.log(complaintId)

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const timelineData = await complaint.getSlaTimeLines();

    return res.status(200).json({
      success: true,
      message: "SLA timelines fetched successfully",
      data: timelineData,
    });
  } catch (error) {
    console.error("Error fetching SLA timeline:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
