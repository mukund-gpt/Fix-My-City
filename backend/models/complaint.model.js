import mongoose from "mongoose";

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
      required: true,
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
  },
  { timestamps: true }
);

complaintSchema.pre("save", function (next) {
  if (this.isNew && !this.deadline) {
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

  if (this.status !== "RESOLVED" && this.deadline) {
    this.isOverdue = new Date() > this.deadline;
  }

  next();
});

complaintSchema.methods.updateStatus = function (newStatus, userId) {
  const now = new Date();

  this.status = newStatus;

  if (newStatus === "RESOLVED") {
    this.resolvedAt = now;
    this.totalTimeToResolve = now - this.createdAt;
  }

  return this.save();
};

complaintSchema.methods.assignStaff = function (staffId) {
  this.assignedTo.push(staffId);
  return this.save();
};

complaintSchema.statics.getOverdueComplaints = function () {
  return this.find({
    status: { $ne: "RESOLVED" },
    deadline: { $lt: new Date() },
  })
    .populate("citizen assignedTo", "name email")
    .sort({ deadline: 1 });
};

complaintSchema.methods.getSlaTimeLines = async function () {
  await this.populate({
    path: "commentList",
    populate: {
      path: "author",
      select: "name email role",
    },
    options: { sort: { createdAt: 1 } }, // Sort by oldest first
  });

  const timelines = [];
  let previousTimestamp = this.createdAt;

  for (let i = 0; i < this.commentList.length; i++) {
    const comment = this.commentList[i];
    const currentTimestamp = comment.createdAt;

    const timeDiff = currentTimestamp - previousTimestamp;

    const hoursSpent = Math.round((timeDiff / (1000 * 60 * 60)) * 100) / 100;

    timelines.push({
      person: {
        id: comment.author._id,
        name: comment.author.name,
        email: comment.author.email,
        role: comment.author.role,
      },
      responseTime: {
        milliseconds: timeDiff,
        hours: hoursSpent,
        days: Math.round((hoursSpent / 24) * 100) / 100,
      },
      comment: {
        id: comment._id,
        text: comment.commentText,
        hoursSpentWorking: comment.hoursSpent || 0,
      },
      timestamp: {
        from: previousTimestamp,
        to: currentTimestamp,
      },
      isFirstResponse: i === 0,
    });

    previousTimestamp = currentTimestamp;
  }
  const summary = {
    totalResponseTime: {
      milliseconds: this.totalTimeToResolve || 0,
      hours:
        Math.round(((this.totalTimeToResolve || 0) / (1000 * 60 * 60)) * 100) /
        100,
      days:
        Math.round(
          ((this.totalTimeToResolve || 0) / (1000 * 60 * 60 * 24)) * 100
        ) / 100,
    },
    firstResponseTime: timelines.length > 0 ? timelines[0].responseTime : null,
    totalComments: this.commentList.length,
    status: this.status,
    isOverdue: this.isOverdue,
  };
  return {
    complaintId: this._id,
    title: this.title,
    createdAt: this.createdAt,
    resolvedAt: this.resolvedAt,
    timelines,
    summary,
  };
};

export default mongoose.model("Complaint", complaintSchema);
