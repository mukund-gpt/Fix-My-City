
import Complaint from "../models/complaint.model.js";


export const createComplaint= async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, description, location } = req.body;

    const complaint = new Complaint({
      citizen: req.user._id,
      title,
      description,
      location,
      photo: req.file ? req.file.path : null,
      status: "OPEN", 
      assignedTo: null, 
      
    });

    const createdComplaint = await complaint.save();
    res.status(201).json(createdComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("citizen", "name email") // Populate citizen details
      .populate("assignedTo", "name email"); // Populate assigned staff details
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateComplaintByStaff = async (req, res) => {
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
export const getmyComplaints = async (req, res) => {
  // console.log('user in get complaints');
  try {
    console.log('user in get complaints', req.user);
    const complaints = await Complaint.find({ citizen: req.user.id }).populate("citizen", "name email"); 
    console.log('complaints', complaints);
    
    res.json(complaints);
  } catch (error) {
    res.status(502).json({ message: error.message });
  }
};
export const getComplaintsById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("citizen", "name email");  
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const assignComplaint = async (req, res) => {
  try {
    const { complaintId, staffId } = req.body;    
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    complaint.assignedTo = staffId; // Assign the complaint to a staff member
    const updatedComplaint = await complaint.save();
    res.json(updatedComplaint);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// export default {
//   assignComplaint,
//   getComplaintsById,
//   getmyComplaints,
//   createComplaint,
//   getComplaints,
//   updateComplaint,
// };
