import mongoose from "mongoose";

const slaConfigSchema = new mongoose.Schema({
  HIGH: {
    TTA: { type: Number, required: true }, // Time to Acknowledge (hours)
    TTR: { type: Number, required: true }, // Time to Resolve (hours)
  },
  MEDIUM: {
    TTA: { type: Number, required: true },
    TTR: { type: Number, required: true },
  },
  LOW: {
    TTA: { type: Number, required: true },
    TTR: { type: Number, required: true },
  },
}, { timestamps: true });

export default mongoose.model("SLAConfig", slaConfigSchema);
