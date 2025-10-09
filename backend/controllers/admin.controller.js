import mongoose from "mongoose";
import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
import { staffComplaintTemplate } from "../utills/emails.js";
import { sendMail } from "../utills/mailer.js";
export const logoutAdmin = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Admin logout failed" });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Admin logout successful" });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAdminDetails = async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ message: "Admin not authenticated" });
    }
    res.status(200).json({ admin: req.session.admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const verifyAdmin = async (req, res) => {
  const { secretKey } = req.body;
  try {
    if (secretKey === process.env.ADMIN_SECRET_KEY) {
      req.session.admin = { isAdmin: true };
      res.status(200).json({ message: "Admin verified successfully" });
    } else {
      res.status(403).json({ message: "Invalid secret key" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignComplaint = async (req, res) => {
  const { complaintId, userIds } = req.body; // array of staff IDs

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res
      .status(400)
      .json({ message: "No staff selected for assignment" });
  }

  try {
    const complaint = await Complaint.findById(complaintId).populate(
      "citizen",
      "name email"
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (!Array.isArray(complaint.assignedTo)) {
      complaint.assignedTo = [];
    }

    // Add staff IDs if not already assigned
    for (const id of userIds) {
      if (
        mongoose.Types.ObjectId.isValid(id) &&
        !complaint.assignedTo.includes(id)
      ) {
        complaint.assignedTo.push(id);
      }
    }

    // Update status
    complaint.status = "IN_PROGRESS";
    await complaint.save();

    // Fetch assigned staff details
    const assignedStaff = await User.find({
      _id: { $in: complaint.assignedTo },
      role: "staff",
    }).select("name email");

    // Send individual emails using template
    for (const staff of assignedStaff) {
      const staffMsg = staffComplaintTemplate(staff, complaint);
      sendMail(
        [staff.email],
        "🛠️ New Complaint Assigned – FixMyCity",
        staffMsg
      );
    }

    // Get assigned departments
    const assignedDepartments = await User.find({
      _id: { $in: complaint.assignedTo },
    }).distinct("department");

    res.status(200).json({
      message: "Complaint assigned successfully",
      complaint,
      assignedDepartments,
    });
  } catch (error) {
    console.error("Error assigning complaint:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate(
      "assignedTo",
      "name email"
    );
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateComplaintByAdmin = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    complaint.status = status;
    await complaint.save();
    res
      .status(200)
      .json({ message: "Complaint updated successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStaffByDepartment = async (req, res) => {
  try {
    // console.log('somone is demanind all staff ');

    const search = req.query.search || "";
    let staff;

    if (search.trim() === "") {
      // No search query → return all staff
      staff = await User.find({ role: "staff" }).select(
        "name email department"
      );
    } else {
      // Search query provided → filter by department
      const regex = new RegExp(search, "i"); // case-insensitive
      staff = await User.find({
        role: "staff",
        department: { $regex: regex },
      }).select("name email department");
    }

    // console.log("staff:", staff);
    res.status(200).json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getanalyatics = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: "RESOLVED" });
    const inProgress = await Complaint.countDocuments({
      status: "IN_PROGRESS",
    });
    const open = await Complaint.countDocuments({ status: "OPEN" });

    const urgencyCounts = await Complaint.aggregate([
      { $group: { _id: "$urgency", count: { $sum: 1 } } },
    ]);

    const locationCounts = await Complaint.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalComplaints,
      resolved,
      inProgress,
      open,
      urgencyCounts,
      locationCounts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const { role } = req.query;

    let filter = {};
    if (role) {
      filter.role = role;
    } else {
      filter.role = "citizen";
    }

    const users = await User.find(filter).select("-password -__v");

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
