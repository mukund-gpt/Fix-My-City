
import Complaint from "../models/complaint.model.js";

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
const createComplaint = async (req, res) => {
  try {
    const { title, description, location } = req.body;

    const complaint = new Complaint({
      citizen: req.user._id,
      title,
      description,
      location,
      photo: req.file ? req.file.path : null,
    });

    const createdComplaint = await complaint.save();
    res.status(201).json(createdComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    let complaints;
    if (req.user.role === "citizen") {
      complaints = await Complaint.find({ citizen: req.user._id }).populate("citizen", "name email");
    } else {
      complaints = await Complaint.find().populate("citizen", "name email");
    }
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status or assignment
// @route   PUT /api/complaints/:id
// @access  Private (Staff/Admin)
const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const { status, assignedTo } = req.body;
    if (status) complaint.status = status;
    if (assignedTo) complaint.assignedTo = assignedTo;

    const updatedComplaint = await complaint.save();
    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export default {
  createComplaint,
  getComplaints,
  updateComplaint,
};
