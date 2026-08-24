import mongoose from "mongoose";

// Assuming a Comment model exists for referencing
// export default mongoose.model("Comment", commentSchema); 

const complaintSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    urgency: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "LOW" },
    location: { type: String },
    longitude: { type: Number },
    latitude: { type: Number },
    photos: [{ type: String }],
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
      default: "OPEN",
    },

    commentList: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deadline: {
      type: Date,
    },
    isOverdue: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
    totalTimeToResolve: {
      type: Number, // in milliseconds
    },
    
    // --- Escalation Fields ---
    escalationLevel: { 
        type: Number, 
        default: 0, // 0: No Escalation, 1: TTA Missed, 2: TTR Missed, 3: Critical
        min: 0 
    },
    lastEscalatedAt: {
      type: Date,
    },
    escalationReason: { 
        type: String, 
        enum: ["TTA_MISSED", "TTR_MISSED", "FUNCTIONAL_NEED", "CITIZEN_REQUEST", null], 
        default: null
    },
  },
  { timestamps: true }
);

// --- PRE-SAVE HOOK (for Deadline and Overdue Check) ---
complaintSchema.pre("save", async function (next) {
    
  // 1. Dynamic Deadline Calculation (TTR)
  if (this.isNew && !this.deadline) {
    const SLAConfig = mongoose.model('SLAConfig');
    // Find the latest SLA configuration
    const slaConfig = await SLAConfig.findOne().sort({ createdAt: -1 });

    if (slaConfig) {
        const urgencyConfig = slaConfig[this.urgency];
        if (urgencyConfig && urgencyConfig.TTR) {
            const ttrHours = urgencyConfig.TTR;
            const now = new Date();
            // Set the TTR deadline (which is the current 'deadline' field)
            this.deadline = new Date(now.getTime() + ttrHours * 60 * 60 * 1000); 
        }
    } else {
        // Fallback to hardcoded if no SLA config is found (or handle error)
        const now = new Date();
        switch (this.urgency) {
            case "HIGH":
                this.deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
                break;
            case "MEDIUM":
                this.deadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
                break;
            case "LOW":
                this.deadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
                break;
        }
    }
  }

  // 2. Overdue Check
  if (this.status !== "RESOLVED" && this.deadline) {
    this.isOverdue = new Date() > this.deadline;
  }
  
  next();
});

// --- INSTANCE METHODS ---

complaintSchema.methods.updateStatus = function (newStatus, userId) {
  const now = new Date();

  this.status = newStatus;

  if (newStatus === "RESOLVED") {
    this.resolvedAt = now;
    // Calculate total time to resolve from creation time
    this.totalTimeToResolve = now.getTime() - this.createdAt.getTime(); 
  }

  return this.save();
};

complaintSchema.methods.assignStaff = function (staffId) {
  if (!this.assignedTo.includes(staffId)) {
    this.assignedTo.push(staffId);
  }
  return this.save();
};

complaintSchema.methods.escalate = async function (escalationReason, targetStaffId, newEscalationLevel, newUrgency) {
    
    // 1. Setup Notification and Assignment Lists
    const Notification = mongoose.model('Notification'); // Access the new model
    const staffIdsToNotify = new Set();
    
    // Add all currently assigned staff (for update/alert notification)
    this.assignedTo.forEach(id => staffIdsToNotify.add(id.toString()));

    // 2. Assign to the new staff (e.g., Team Lead or Manager)
    if (targetStaffId) {
        const staffIds = this.assignedTo.map(id => id.toString());
        if (!staffIds.includes(targetStaffId.toString())) {
             this.assignedTo.push(targetStaffId);
        }
        // Add the new target to the notification list
        staffIdsToNotify.add(targetStaffId.toString());
    }
    
    // 3. Update core fields: escalation tracking and URGENCY
    this.escalationLevel = newEscalationLevel; 
    this.lastEscalatedAt = new Date(); 
    this.escalationReason = escalationReason; 
    
    if (newUrgency && newUrgency !== this.urgency) {
        this.urgency = newUrgency;
    }

    // 4. Save the changes to the Complaint document
    await this.save(); 

    // 5. Send Notifications
    if (Notification) {
        const title = `🚨 ESCALATED TO LEVEL ${newEscalationLevel} - ${this.urgency} Urgency`;
        const messageBase = `Complaint: "${this.title}" (${this.urgency}) missed its SLA and has been escalated. Reason: ${escalationReason.replace(/_/g, ' ')}. It requires immediate attention.`;
        
        const notificationPromises = Array.from(staffIdsToNotify).map(staffId => {
            return Notification.create({ 
                recipient: [staffId], 
                sender: null, 
                title: title,
                message: messageBase,
                type: 'ALERT', // Use ALERT for high-priority escalation
                referenceId: this._id,
            });
        });
        
        await Promise.all(notificationPromises);
        console.log(`[Escalation] Notified ${staffIdsToNotify.size} staff members for Complaint ${this._id}.`);
    } else {
        console.error("Notification model not available for escalation alerts.");
    }
    
    return this;
};

// --- STATIC METHODS (MODIFIED) ---

complaintSchema.statics.escalateOverdueComplaints = async function () {
    const SLAConfig = mongoose.model('SLAConfig');
    const slaConfig = await SLAConfig.findOne().sort({ createdAt: -1 });

    if (!slaConfig) {
        console.error("SLA configuration not found. Escalation job aborted.");
        return 0;
    }

    const now = new Date();
    let escalatedCount = 0;

    // ... (rest of the initial fetching remains the same) ...
    const complaints = await this.find({ 
        status: { $ne: "RESOLVED" } 
    }).populate("assignedTo", "_id");

    // Placeholder function for demonstration 
    // (Replace with your actual User lookup logic from the previous answer)
    const findTargetStaffId = async (level, urgency, complaint) => {
        return null;
    };
    // ------------------------------------------------------------------

    for (const complaint of complaints) {
        const urgencyConfig = slaConfig[complaint.urgency];
        if (!urgencyConfig) continue;
        
        let targetEscalationLevel = complaint.escalationLevel;
        let escalationReason = null;
        let newUrgency = complaint.urgency; // Default to current urgency

        // --- TTA Check (Escalation Level 1) ---
        if (complaint.status === "OPEN" && complaint.commentList.length === 0 && urgencyConfig.TTA) {
            const ttaDeadline = new Date(complaint.createdAt.getTime() + urgencyConfig.TTA * 60 * 60 * 1000);
            
            if (now > ttaDeadline && complaint.escalationLevel < 1) {
                targetEscalationLevel = 1;
                escalationReason = "TTA_MISSED";
                // Optional: Slightly raise urgency for TTA failure
                if (newUrgency === 'LOW') newUrgency = 'MEDIUM'; 
            }
        }
        
        // --- TTR Check (Escalation Level 2) ---
        if (complaint.deadline && now > complaint.deadline) {
            if (complaint.escalationLevel < 2) {
                targetEscalationLevel = 2;
                escalationReason = "TTR_MISSED";
                // CRITICAL: Force urgency to HIGH when the resolution deadline is missed
                newUrgency = "HIGH"; 
            }
        }

        // --- Execute Escalation ---
        if (targetEscalationLevel > complaint.escalationLevel) {
            
            const targetStaffId = await findTargetStaffId(
                targetEscalationLevel, 
                complaint.urgency, 
                complaint 
            ); 

            if (!targetStaffId) {
                console.warn(`Could not find a staff member for Level ${targetEscalationLevel} escalation on complaint ${complaint._id}. Skipping.`);
                continue;
            }
            
            try {
                // PASS THE NEW URGENCY TO THE ESCALATE METHOD
                await complaint.escalate(escalationReason, targetStaffId, targetEscalationLevel, newUrgency); 
                
                // IMPORTANT: You should update the assignedComplaintCount for the User here
                // e.g., await User.findByIdAndUpdate(targetStaffId, { $inc: { assignedComplaintCount: 1 } });
                
                escalatedCount++;
            } catch (error) {
                console.error(`Failed to escalate complaint ${complaint._id}:`, error);
            }
        }
    }

    return escalatedCount;
};

export default mongoose.model("Complaint", complaintSchema);