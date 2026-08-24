import axios from "axios";
import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
import cloudinary from "../utills/cloudinary.js";
import { notifyCreateComplaint } from "../utills/emails.js";
import { broadcastDashboardUpdate } from "../utills/socket.js";
import { createNotification } from "./notification.controller.js";

export const createComplaint = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // console.log("Files received:", req.files);
    // console.log("Body:", req.body);
    const { title, description, latitude, longitude } = req.body;

    const flaskURL = `${process.env.FLASK_SERVER}/api/check-duplicate`;
    console.log("Flask URL:", flaskURL);
    const duplicateResponse = await axios.post(
      flaskURL,
      {
        target: {
          title,
          description,
          latitude,
          longitude,
          created_at: new Date().toISOString(),
        },
      },
      {
        proxy: false,
      },
    );
    console.log("AFTER FLASK", duplicateResponse.status);
    console.log("FLASK RESPONSE", duplicateResponse.data);
    // console.log(duplicateResponse);

    if (duplicateResponse.data.has_duplicates) {
      console.log("duplicate comment found");

      return res.status(200).json({
        message: "Similar complaint is alredy registered",
      });
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
      assignedTo: [],
      urgency: duplicateResponse?.data?.urgency,
    });

    const recipients = await User.find({
      // Query for users who handle new complaints
      role: { $in: ["admin"] },
    }).select("_id");

    const recipientIds = recipients.map((r) => r._id);
    await createNotification({
      recipientIds,
      title: `🚨 NEW Complaint Filed: ${title}`,
      message: `A new complaint has been filed by ${req.user.name}. It is now ${complaint.status} with Urgency: ${complaint.urgency}.`,
      type: "NEW_COMPLAINT",
      referenceId: complaint._id,
    });

    const createdComplaint = await complaint.save();
    await broadcastDashboardUpdate(); // live stat update
    const citizen = await User.findById(req.user.id);
    notifyCreateComplaint(citizen.name, citizen.email, title);
    res
      .status(201)
      .json({ success: true, message: "Complaint created successfully" });
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

    if (!complaint.assignedTo.some((staffId) => staffId.equals(req.user._id))) {
      return res
        .status(403)
        .json({ message: "Complaint is not assigned to you" });
    }

    const { status, assignedTo } = req.body;
    if (status) {
      if (!["OPEN", "IN_PROGRESS", "RESOLVED"].includes(status)) {
        return res.status(400).json({ message: "Invalid complaint status" });
      }
      complaint.status = status;
      if (status === "RESOLVED") {
        complaint.resolvedAt = new Date();
        complaint.totalTimeToResolve =
          complaint.resolvedAt - complaint.createdAt;
      }
    }
    if (assignedTo) {
      return res
        .status(403)
        .json({ message: "Staff cannot reassign complaints" });
    }

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
      "name email",
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
        path: "commentList", // Populate comments
        populate: { path: "author", select: "name email" }, // Populate comment authors
      });
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
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 12, 1),
      50,
    );

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
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
};

export const getComplaintSlaTimeline = async (req, res) => {
  try {
    const complaintId = req.params.id;
    console.log(complaintId);

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    const timelineData = [
      { status: "OPEN", at: complaint.createdAt },
      ...(complaint.status !== "OPEN" && complaint.updatedAt
        ? [{ status: complaint.status, at: complaint.updatedAt }]
        : []),
      ...(complaint.resolvedAt
        ? [{ status: "RESOLVED", at: complaint.resolvedAt }]
        : []),
    ];

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
