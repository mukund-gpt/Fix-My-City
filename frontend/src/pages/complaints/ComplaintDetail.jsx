import CloseIcon from "@mui/icons-material/Close";
import PhotoCamera from "@mui/icons-material/PhotoCamera"; // NEW: For image upload icon
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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

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
  // Helper to format date
  const formattedDate =
    new Date(comment.createdAt).toLocaleDateString() +
    " " +
    new Date(comment.createdAt).toLocaleTimeString();
  // console.log(comment);

  return (
    <Box className="p-3 border rounded-lg shadow-sm bg-blue-50">
      <div className="flex justify-between items-center mb-1">
        <Typography variant="subtitle2" className="font-bold text-indigo-700">
          {comment.author.name}
          <span className="text-xs font-normal ml-2 text-gray-500">
            ({comment.author.email})
          </span>
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
      {comment.imageUrl.length !== 0 && (
        <Box className="mt-2">
          {/* NOTE: Adjust the path/URL based on your backend storage setup */}
          <img
            src={comment.image}
            alt="Evidence"
            className="max-h-40 w-full object-contain rounded border"
          />
          <Typography variant="caption" className="text-gray-500 mt-1 block">
            Evidence Image
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
        { headers: { Authorization: `Bearer ${token}` } }
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
      // Assume your API for staff comments is at /staff/complaints/comment
      const res = await axiosInstance.post(
        `/staff/complaints/comment`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Content-Type: multipart/form-data is usually handled automatically by axios
          },
        }
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
      const res = await axiosInstance.put(
        `/admin/complaints/${complaint._id}`,
        {}, // Empty body is fine if the status is updated based on the ID
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedComplaint = res?.data?.complaint;
      setComplaint(updatedComplaint);

      toast.success(
        `Complaint #${complaint.complaintId} successfully marked as Resolved! 🎉`
      );
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to mark complaint as resolved."
      );
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

  const isResolved = complaint.status === "Resolved";

  return (
    <Box sx={{ flexGrow: 1 }} className="bg-gray-800 min-h-screen">
      <div className="p-6 max-w-6xl mx-auto ">
        <h1 className="text-3xl font-extrabold text-indigo-800 mb-6 border-b pb-2">
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
            <ComplaintCard complaint={complaint} />
          </div>

          {/* RIGHT SIDE: Admin/Staff Actions Panel (1/3 width) */}
          {(userRole === "admin" || userRole === "staff") && (
            <Box className="lg:col-span-1">
              <Box className="bg-white p-6 rounded-xl shadow-2xl sticky top-4">
                <Typography
                  variant="h6"
                  component="h2"
                  className="font-bold text-indigo-600 mb-4"
                >
                  {userRole === "admin"
                    ? "Admin Actions"
                    : "Resolution Log & Actions"}
                </Typography>
                <Divider className="mb-4" />

                {/* --- STAFF ACTIONS SECTION --- */}
                {userRole === "staff" && (
                  <Box className="mb-6">
                    <Typography
                      variant="subtitle1"
                      className="font-bold text-gray-700 mb-4"
                    >
                      Add Resolution Update
                    </Typography>

                    {/* 1. New Comment Form */}
                    <StaffCommentForm
                      onSubmit={handleCommentSubmit}
                      isSubmitting={isSubmittingComment}
                    />

                    <Divider className="my-6" />

                    {/* 2. Display Existing Comments */}
                    <Typography
                      variant="subtitle1"
                      className="font-bold text-gray-700 mb-2"
                    >
                      Comment History:
                    </Typography>
                    <Box className="max-h-96 overflow-y-auto space-y-3 p-1">
                      {/* Assuming your complaint object has a 'comments' array */}
                      {complaint?.commentList &&
                      complaint.commentList.length > 0 ? (
                        complaint.commentList.map((comment) => (
                          <CommentDisplay key={comment._id} comment={comment} />
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No resolution comments yet.
                        </p>
                      )}
                    </Box>
                  </Box>
                )}

                {/* --- ADMIN ACTIONS SECTION --- */}
                {userRole === "admin" && (
                  <>
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
          <Box className="p-6 h-full flex flex-col bg-gray-50">
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
                selectedStaff={selectedStaffIds}
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
