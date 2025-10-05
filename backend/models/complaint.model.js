import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  photo: { type: String },
  status: { type: String, enum: ["OPEN", "IN_PROGRESS", "RESOLVED"], default: "OPEN" },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId, ref: "User",
    
   }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Complaint", complaintSchema);
