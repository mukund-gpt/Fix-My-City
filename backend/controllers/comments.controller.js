import Comment from "../models/comment.model.js";
import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
import cloudinary from "../utills/cloudinary.js";

export const createComment = async (req, res) => {
  console.log(req.user);

  try {
    let { text: commentText, complaintId } = req.body;

    if (!commentText) {
      commentText = "Done";
    }

    // Verify that the complaint exists
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const userId = req.user._id || req.user.id;
    const account = await User.findById(userId).select("role");
    if (!account) {
      return res.status(401).json({ message: "User account not found" });
    }
    const isAdmin = account?.role === "admin";
    const assignedStaff = Array.isArray(complaint.assignedTo)
      ? complaint.assignedTo
      : [];
    const isAssignedStaff = assignedStaff.some((staffId) =>
      staffId.toString() === userId.toString(),
    );
    const isComplaintOwner = complaint.citizen.toString() === userId.toString();

    if (!isAdmin && !isAssignedStaff && !isComplaintOwner) {
      return res
        .status(403)
        .json({ message: "You are not allowed to comment on this complaint" });
    }

    let imageUrl = [];
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "fixmycity/comments" },
          (error, result) => (error ? reject(error) : resolve(result)),
        );
        stream.end(req.file.buffer);
      });
      imageUrl = [uploadResult.secure_url];
    }

    // Create the new comment
    const comment = new Comment({
      complaint: complaintId,
      author: userId,
      commentText,
      imageUrl: imageUrl || [], // Ensure imageUrl is an array
    });

    const createdComment = await comment.save();

    // Push the comment to complaint.commentList
    complaint.commentList.push(createdComment._id);
    await complaint.save();

    await complaint.populate({
      path: "commentList",
      populate: { path: "author", select: "name email" },
    });

    res.status(201).json({ complaint });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Server error while creating comment" });
  }
};

export const editComment = async (req, res) => {
  const { commentText, imageUrl } = req.body;
  const { commentId } = req.params;

  try {
    //Find the comment by its ID
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Ensure the logged-in user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "User not authorized to edit this comment" });
    }

    //Update the fields
    comment.commentText = commentText || comment.commentText;
    if (imageUrl) {
      comment.imageUrl = imageUrl;
    }

    //Save the updated comment
    const updatedComment = await comment.save();

    //Populate author details for a consistent response
    const populatedComment = await Comment.findById(
      updatedComment._id,
    ).populate("author");

    res.status(200).json(populatedComment);
  } catch (error) {
    console.error("Error editing comment:", error);
    res.status(500).json({ message: "Server error while editing comment" });
  }
};
