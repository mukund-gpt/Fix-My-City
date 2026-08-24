import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCamera from "@mui/icons-material/PhotoCamera"; // NEW: For image upload icon
import ReplayIcon from "@mui/icons-material/Replay";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosinstance.js";
import ComplaintCard from "../../components/ComplainCard.jsx";
import StaffSearch from "../admin/Search.jsx";

// 1. StaffCommentForm Component (Handles comment input and image upload)
const StaffCommentForm = ({ onSubmit, isSubmitting }) => {
  const [commentText, setCommentText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim() === "" && !imageFile) {
      toast.error("Please add a comment or upload an image.");
      return;
    }
    // Call the parent handler
    onSubmit({ text: commentText, imageFile });
    // Reset form after submission (assuming parent handles success/error)
    setCommentText("");
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className="space-y-4">
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Add Resolution Details or Comment"
        variant="outlined"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        disabled={isSubmitting}
        size="small"
      />

      {/* Image Upload Button */}
      <Box className="flex flex-col space-y-2">
        <Box className="flex items-center space-x-3">
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="icon-button-file"
            type="file"
            onChange={handleFileChange}
            disabled={isSubmitting}
          />
          <label htmlFor="icon-button-file">
            <IconButton
              color="primary"
              component="span"
              aria-label="upload picture"
              disabled={isSubmitting}
            >
              <PhotoCamera />
            </IconButton>
          </label>
          <Typography variant="body2" color="textSecondary">
            {imageFile ? imageFile.name : "Optional: Upload Evidence Image"}
          </Typography>
        </Box>

        {/* Image Preview and Remove Button */}
        {imagePreview && (
          <Box className="flex flex-col items-start p-2 border rounded bg-gray-50">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-32 object-contain rounded"
            />
            <Button
              size="small"
              color="error"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              className="mt-1"
            >
              Remove Image
            </Button>
          </Box>
        )}
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="success"
        fullWidth
        disabled={isSubmitting || (commentText.trim() === "" && !imageFile)}
      >
        {isSubmitting ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Submit Resolution Log"
        )}
      </Button>
    </Box>
  );
};

// 2. CommentDisplay Component (Placeholder to display a single comment)
// Assumes a comment object looks like: { _id, text, image, user: { name, role }, createdAt }
const CommentDisplay = ({ comment }) => {
  const authorName = comment.author?.name || "Unknown user";
  const authorEmail = comment.author?.email;
  // Helper to format date
  const commentDate = comment.createdAt ? new Date(comment.createdAt) : null;
  const formattedDate =
    commentDate && !Number.isNaN(commentDate.getTime())
      ? `${commentDate.toLocaleDateString()} ${commentDate.toLocaleTimeString()}`
      : "Date unavailable";
  // console.log(comment);

  return (
    <Box className="rounded-lg border border-blue-100 bg-blue-50 p-3 shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <Typography variant="subtitle2" className="font-bold text-indigo-700">
          {authorName}
          {authorEmail && (
            <span className="text-xs font-normal ml-2 text-gray-500">
              ({authorEmail})
            </span>
          )}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {formattedDate}
        </Typography>
      </div>
      <Typography
        variant="body2"
        className="text-gray-800 whitespace-pre-wrap mb-2"
      >
        {comment.commentText}
      </Typography>
      {comment.imageUrl?.length > 0 && (
        <Box className="mt-2">
          {comment.imageUrl.map((imageUrl) => (
            <img
              key={imageUrl}
              src={imageUrl}
              alt="Evidence"
              className="mb-2 max-h-40 w-full rounded border object-contain last:mb-0"
            />
          ))}
          <Typography variant="caption" className="mt-1 block text-gray-500">
            Evidence Image{comment.imageUrl.length > 1 ? "s" : ""}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// --- Main Component ---
const DRAWER_WIDTH = 500;

const ComplaintDetail = () => {
  const { id } = useParams();
  const { userRole, user } = useSelector((state) => state.auth);
  const [complaint, setComplaint] = useState(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false); // NEW State for comment loading
  const [isMarkingResolved, setIsMarkingResolved] = useState(false);
  const token = user?.token;

  // Fetch complaint
  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await axiosInstance.get(`/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedComplaint = res.data;
        setComplaint(fetchedComplaint);

        const initialIds = fetchedComplaint.assignedTo
          ? fetchedComplaint.assignedTo.map((staff) => staff._id)
          : [];
        setSelectedStaffIds(initialIds);
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Error fetching complaint");
      }
    };

    if (token) {
      fetchComplaint();
    }
  }, [id, token]);

  // Handle assignment API call (Admin Only)
  const handleAssignStaff = async (selectedIds) => {
    // ... (Existing implementation for handleAssignStaff) ...
    try {
      if (selectedIds.length === 0) {
        toast("Please select at least one staff member.", { icon: "⚠️" });
        return;
      }

      const res = await axiosInstance.put(
        `/admin/complaints/assign`,
        { complaintId: complaint._id, userIds: selectedIds },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const updatedComplaint = res?.data?.complaint;
      setComplaint(updatedComplaint);

      const updatedIds = updatedComplaint.assignedTo
        ? updatedComplaint.assignedTo.map((staff) => staff._id)
        : [];
      setSelectedStaffIds(updatedIds);

      toast.success("Complaint assigned successfully!");
      setIsDrawerOpen(false); // Close drawer after success
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign staff");
    }
  };

  // NEW: Handle Staff Comment Submission
  const handleCommentSubmit = async ({ text, imageFile }) => {
    setIsSubmittingComment(true);
    const formData = new FormData();
    formData.append("text", text);
    formData.append("complaintId", complaint._id);
    if (imageFile) {
      formData.append("image", imageFile); // 'image' should match the field name your backend expects
    }

    try {
      const res = await axiosInstance.post(
        userRole === "admin"
          ? `/admin/complaints/comment`
          : userRole === "staff"
            ? `/staff/complaints/comment`
            : `/complaints/comment`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Content-Type: multipart/form-data is usually handled automatically by axios
          },
        },
      );

      // Update the complaint state with the new comment and comments array
      const updatedComplaint = res?.data?.complaint;
      // The backend should return the full updated complaint object
      setComplaint(updatedComplaint);

      toast.success("Comment and evidence added successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleMarkResolved = async () => {
    if (complaint.status === "Resolved") {
      toast("This complaint is already marked as Resolved.", { icon: "ℹ️" });
      return;
    }

    setIsMarkingResolved(true);
    try {
      // Assume the API endpoint is /admin/complaints/resolve/:id and uses a PUT request
      // console.log(complaint);

      const res = await axiosInstance.put(
        `/admin/complaints/${complaint._id}`,
        {}, // Empty body is fine if the status is updated based on the ID
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const updatedComplaint = res?.data?.data;
      // console.log(res.data);

      setComplaint(updatedComplaint);

      toast.success(
        `Complaint #${complaint._id} successfully marked as Resolved! 🎉`,
      );
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to mark complaint as resolved.",
      );
    } finally {
      setIsMarkingResolved(false);
    }
  };

  const handleReopen = async () => {
    setIsMarkingResolved(true);
    try {
      const res = await axiosInstance.post(
        `/admin/complaints/${complaint._id}/reopen`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setComplaint(res?.data?.data);
      toast.success("Complaint reopened successfully.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reopen complaint.");
    } finally {
      setIsMarkingResolved(false);
    }
  };

  if (!complaint)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <CircularProgress />
        <p className="ml-4 text-xl text-gray-700">
          Loading complaint details...
        </p>
      </div>
    );

  const isResolved = complaint.status === "RESOLVED";

  return (
    <Box sx={{ flexGrow: 1 }} className="min-h-screen bg-white">
      <div className="p-6 max-w-6xl mx-auto ">
        <h1 className="mb-6 border-b pb-2 text-3xl font-extrabold text-slate-900">
          Complaint Resolution Hub
        </h1>

        {/* --- Two-Column Layout (3-col for admin, 1-col for others) --- */}
        <div
          className={`grid ${
            userRole === "admin" ? "lg:grid-cols-3" : "grid-cols-1"
          } gap-6`}
        >
          {/* LEFT SIDE: Complaint Detail (2/3 width for admin, full width for others) */}
          <div
            className={userRole === "admin" ? "lg:col-span-2" : "col-span-1"}
          >
            <ComplaintCard isShow complaint={complaint} />
          </div>

          {/* RIGHT SIDE: Role-specific comment and management panel */}
          {(userRole === "admin" ||
            userRole === "staff" ||
            (userRole === "citizen" &&
              String(complaint.citizen?._id || complaint.citizen) ===
                String(user?._id || user?.id))) && (
            <Box className="lg:col-span-1">
              <Box className="bg-white p-6 rounded-xl shadow-2xl sticky top-4">
                <Typography
                  variant="h6"
                  component="h2"
                  className="font-bold text-indigo-600 mb-4"
                >
                  {userRole === "admin"
                    ? "Admin Actions"
                    : userRole === "staff"
                      ? "Resolution Log & Actions"
                      : "Complaint Discussion"}
                </Typography>
                <Divider className="mb-4" />

                {/* --- STAFF ACTIONS SECTION --- */}
                {(userRole === "staff" ||
                  userRole === "admin" ||
                  userRole === "citizen") && (
                  <Box className="mb-6">
                    <Typography
                      variant="subtitle1"
                      className="font-bold text-gray-700 mb-4"
                    >
                      {userRole === "admin"
                        ? "Add Admin Comment"
                        : userRole === "staff"
                          ? "Add Resolution Update"
                          : "Add Comment"}
                    </Typography>

                    {/* 1. New Comment Form */}
                    <StaffCommentForm
                      onSubmit={handleCommentSubmit}
                      isSubmitting={isSubmittingComment}
                    />

                    <Divider className="my-6" />
                  </Box>
                )}

                {/* --- ADMIN ACTIONS SECTION --- */}
                {userRole === "admin" && (
                  <>
                    {complaint.status !== "OPEN" && (
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleReopen}
                        disabled={isMarkingResolved}
                        startIcon={<ReplayIcon />}
                        className="mb-4"
                      >
                        REOPEN COMPLAINT
                      </Button>
                    )}
                    {/* making complaint as resolved */}
                    <Button
                      variant="contained"
                      color="error" // Use a striking color for a major action
                      fullWidth
                      onClick={handleMarkResolved}
                      disabled={isMarkingResolved || isResolved}
                      startIcon={
                        isMarkingResolved ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <CheckCircleOutlineIcon />
                        )
                      }
                      className="mb-4"
                      sx={{
                        // Change color for resolved state
                        backgroundColor: isResolved ? "#4CAF50" : null,
                        "&:hover": {
                          backgroundColor: isResolved ? "#4CAF50" : null,
                        },
                      }}
                    >
                      {isResolved ? "ALREADY RESOLVED" : "MARK AS RESOLVED"}
                    </Button>
                    {/* Currently Assigned Staff */}
                    <Box className="mb-6">
                      <Typography
                        variant="subtitle1"
                        className="font-bold text-gray-700 mb-2"
                      >
                        Assigned Staff:
                      </Typography>
                      {complaint.assignedTo &&
                      complaint.assignedTo.length > 0 ? (
                        <ul className="list-none space-y-1">
                          {complaint.assignedTo.map((staff) => (
                            <li
                              key={staff._id}
                              className="text-sm text-gray-600 bg-gray-100 p-2 rounded"
                            >
                              <span className="font-medium text-indigo-700">
                                {staff.name}
                              </span>{" "}
                              ({staff.email})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-red-500 font-medium">
                          No staff assigned yet.
                        </p>
                      )}
                    </Box>
                    <Divider className="mb-4" />

                    {/* Assignment Toggle Button (Opens Drawer) */}
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => setIsDrawerOpen(true)}
                    >
                      Assign / Re-assign Staff
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          )}
        </div>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Typography
            variant="h6"
            component="h2"
            className="mb-4 font-bold text-slate-900"
          >
            Comment History
          </Typography>
          <Divider className="mb-4" />
          <Box className="max-h-96 space-y-3 overflow-y-auto p-1">
            {complaint.commentList?.length > 0 ? (
              complaint.commentList.map((comment) => (
                <CommentDisplay key={comment._id} comment={comment} />
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No resolution comments yet.
              </p>
            )}
          </Box>
        </section>
      </div>

      {/* --- Assignment Drawer (Admin Only) --- */}
      {userRole === "admin" && (
        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          <Box className="flex h-full flex-col bg-white p-6">
            {/* Drawer Header */}
            <Box className="flex justify-between items-center mb-6 pb-4 border-b">
              <Typography
                variant="h5"
                component="h2"
                className="font-bold text-indigo-700"
              >
                Assign Staff to Complaint
              </Typography>
              <IconButton
                onClick={() => setIsDrawerOpen(false)}
                aria-label="close"
                size="large"
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Staff Search Content */}
            <Box className="flex-grow overflow-y-auto mb-4">
              <Typography
                variant="subtitle1"
                className="mb-3 font-bold text-gray-700"
              >
                Search and Select Staff:
              </Typography>
              <StaffSearch
                selectedStaff={complaint.assignedTo}
                onChange={setSelectedStaffIds}
              />
            </Box>

            {/* Action Buttons (Fixed at the bottom) */}
            <Box className="pt-4 border-t flex space-x-3">
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => handleAssignStaff(selectedStaffIds)}
              >
                Save Assignment
              </Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={() => setIsDrawerOpen(false)}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default ComplaintDetail;
