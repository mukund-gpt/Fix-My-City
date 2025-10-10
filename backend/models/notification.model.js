import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // The user who receives the notification (required for filtering)
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Indexing is crucial for fast lookups by recipient
    },
    
    // The entity that triggered the notification (e.g., the system or another user)
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    title: { 
        type: String, 
        required: true,
        trim: true,
    },
    
    message: { 
        type: String, 
        required: true,
        trim: true,
    },
    
    // Categorizes the notification (e.g., 'assignment', 'update', 'alert')
    type: {
      type: String,
      enum: ["ASSIGNMENT", "UPDATE", "ALERT", "SYSTEM", "NEW_COMPLAINT"],
      default: "SYSTEM",
    },

    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Complaint",
        default: null, 
    },

    // Status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true } 
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
