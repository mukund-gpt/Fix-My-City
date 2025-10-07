import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosinstance.js";
import ComplaintCard from "../../components/ComplainCard.jsx";
import StaffSearch from "../admin/Search.jsx"; // your existing StaffSearch

const ComplaintDetail = () => {
  const { id } = useParams();
  const { userRole, user } = useSelector((state) => state.auth);
  const [complaint, setComplaint] = useState(null);
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [showAssign, setShowAssign] = useState(false); // new state
  const token = user?.token;

  // Fetch complaint
  useEffect(() => {
    const fetchComplaint = async () => {
      if (!token) {
        toast.error("Please login to view complaint details.");
        return;
      }

      try {
        const res = await axiosInstance.get(`/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComplaint(res.data);
        setAssignedStaff(res.data.assignedTo || []);
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Error fetching complaint");
      }
    };

    fetchComplaint();
  }, [id, token]);

  // Handle assignment callback from StaffSearch
  const handleAssignStaff = async (selectedStaff) => {
    try {
     await axiosInstance.put(
      `/admin/complaints/assign`,
      { complaintId: complaint._id, userIds: selectedStaff }, // selectedStaff is an array
      { headers: { Authorization: `Bearer ${token}` } }
    );
      setComplaint(res.data);
      setAssignedStaff(res.data.assignedTo);
      toast.success("Complaint assigned successfully!");
      setShowAssign(false); // close after assignment
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign staff");
    }
  };

  if (!complaint) return <p className="p-6 text-center">Loading complaint...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Show complaint */}
      <ComplaintCard complaint={complaint} />

      {/* Admin Assignment */}
      {userRole === "admin" && (
        <Box className="mt-4">
          {!showAssign && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowAssign(true)}
            >
              Assign Staff
            </Button>
          )}

          {showAssign && (
            <Box className="mt-4 bg-white p-4 rounded shadow">
              <StaffSearch
                selectedStaff={assignedStaff}
                onChange={setAssignedStaff} // update local state
              />
              <Box className="mt-4 flex space-x-2">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAssignStaff(assignedStaff)}
                >
                  Assign Selected Staff
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setShowAssign(false)}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </div>
  );
};

export default ComplaintDetail;
