import mongoose from "mongoose";
import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
import {
  citizenInProgressTemplate,
  staffComplaintTemplate,
} from "../utills/emails.js";
import { sendMail } from "../utills/mailer.js";
import { broadcastDashboardUpdate } from "../utills/socket.js";
import { createNotification } from "./notification.controller.js";
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
    }).select("name email department");

    await createNotification({
    recipientIds:userIds,
      title: "New Complaint Assigned",
      message: `A new complaint (${complaint.title || complaint._id}) has been assigned to you.`,
      type: "ASSIGNMENT",
      referenceId: complaint._id,
      senderId: req.user.id
    });
    
    //send mail to citizen
    const msg = citizenInProgressTemplate(
      complaint.citizen,
      complaint,
      assignedStaff
    );
    sendMail(
      [complaint.citizen.email],
      "🚧 Your Complaint Is In Progress - FixMyCity",
      msg
    );

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

    await broadcastDashboardUpdate();// live stat update
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
  // 1. Get IDs and Sender Info
  // mainly for resolved 
    const { id } = req.params;
    // Assuming authentication middleware attaches the current user (the resolver) to req.user
    const resolver = req.user; 

    if (!id) {
        return res.status(400).json({ message: "Complaint ID is required." });
    }

    try {
        // 2. Fetch the original complaint to get 'createdAt' for time calculation
      const originalComplaint = await Complaint.findById(id).
        populate(
      "assignedTo",
      "name email"
    );
        if (!originalComplaint) {
            return res.status(404).json({ message: "Complaint not found." });
        }
        
        if (originalComplaint.status === "RESOLVED") {
            return res.status(400).json({ message: "Complaint is already resolved." });
      }
      
        // 3. Calculate time metrics
        const resolvedAt = new Date();
        const createdAt = originalComplaint.createdAt;
        // Calculate total time elapsed since creation in milliseconds
        const totalTimeToResolve = resolvedAt.getTime() - createdAt.getTime(); 

        // 4. Update the complaint document
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            id,
            {
                status: "RESOLVED",
                resolvedAt,
                totalTimeToResolve,
            },
            { new: true } 
        ).populate("citizen", "email name");

        if (!updatedComplaint) {
            return res.status(500).json({ message: "Failed to update complaint status." });
        }


        // 5. Prepare and Send Email Notification
        const citizenEmail = updatedComplaint.citizen?.email;
        const citizenName = updatedComplaint.citizen?.name || "Valued Citizen";

        if (citizenEmail) {
            // Convert milliseconds to a human-readable format (e.g., hours and minutes)
            const minutes = Math.floor(totalTimeToResolve / (1000 * 60));
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            const timeString = hours > 0 
                ? `${hours} hour(s) and ${remainingMinutes} minute(s)` 
                : `${remainingMinutes} minute(s)`;

            // 5.1. Generate the Assigned Staff List
            const assignedStaffList = updatedComplaint?.assignedTo?.map(staff => `* ${staff.name || staff.email}`)
                .join('\n');
            const emailSubject = `Resolution Confirmation: Complaint #${updatedComplaint._id.toString().slice(-5)}`;

            const emailBody = `
Dear ${citizenName},

We are pleased to inform you that your complaint, titled **"${updatedComplaint.title}"**, has been **RESOLVED** by our team.

---
**Resolution Details:**
* **Status:** RESOLVED
* **Time to Resolve:** ${timeString}
* **Resolved By:** ${resolver?.name || resolver?.email || 'A team member'}
* **Date Resolved:** ${resolvedAt.toLocaleDateString()}
---

**Assigned Team:**
${assignedStaffList}

Thank you for your patience and for helping us improve our community services.

Sincerely,
The City Management Team
`;
            await sendMail(citizenEmail, emailSubject, emailBody);
        } else {
            console.warn(`Citizen email not found for complaint ID: ${id}. Skipping email.`);
      }
          await broadcastDashboardUpdate();// live stat update
        res.status(200).json({
            message: "Complaint successfully resolved and citizen notified.",
            data: updatedComplaint,
        });

    } catch (error) {
        console.error("Error resolving complaint:", error);
        res.status(500).json({ message: "An unexpected error occurred while resolving the complaint.", error: error.message });
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

export const runSlaEscalationJob = async (req, res) => {
    try {
        console.log("Starting SLA Escalation Job...");
        
        const count = await Complaint.escalateOverdueComplaints(); 
        
        const message = `SLA Escalation Job finished. ${count} complaints were escalated.`;
        console.log(message);

        // For a true cron job, you wouldn't send a response, but for testing:
        return res.status(200).json({ success: true, message, escalatedCount: count });

    } catch (error) {
        console.error("Error running SLA Escalation Job:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const manuallyEscalateComplaint = async (req, res) => {
    const { id } = req.params;
    const { targetStaffId, reason, currentStaffRole } = req.body; // e.g., reason: "FUNCTIONAL_NEED"

    try {
        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }
        let newLevel = complaint.escalationLevel + 1;
        
        await complaint.escalate(reason, targetStaffId, newLevel);

        return res.status(200).json({ 
            message: `Complaint ${id} manually escalated and reassigned.`,
            complaint: complaint 
        });

    } catch (error) {
        console.error("Error during manual escalation:", error);
        return res.status(500).json({ message: "Internal server error during escalation" });
    }
};
