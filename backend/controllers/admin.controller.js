
import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
export const logoutAdmin = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Admin logout failed" });
      }   
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Admin logout successful" });
    }
    );
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
  }
  catch (error) {

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
  const { complaintId, userId } = req.body; 
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }   
    if (!complaint.assignedTo.includes(userId)) {
      complaint.assignedTo.push(userId);
      await complaint.save();
    } 
    res.status(200).json({ message: "Complaint assigned successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate("assignedTo", "name email"); 
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
    res.status(200).json({ message: "Complaint updated successfully", complaint });
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
