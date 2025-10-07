import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import axiosInstance from "../../api/axiosinstance";
import { useNavigate } from "react-router-dom";
import ComplaintCard from "../../components/ComplainCard";

const ViewAssignedComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const token = useSelector((state) => state.auth.user.token);

  useEffect(() => {
    const fetchAssignedComplaints = async () => {
      if (!token) {
        toast.error("Please login to view assigned complaints.");
        return;
      }

      try {
        const res = await axiosInstance.get("/staff/complaints", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setComplaints(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Error fetching assigned complaints:", error);
        toast.error(
          error.response?.data?.message || "Error fetching assigned complaints"
        );
      }
    };

    fetchAssignedComplaints();
  }, [token]);

  if (!token) {
    return <div>Please login to view assigned complaints.</div>;
  }

  return (
    <div className="p-3">
      <h2 className="text-2xl font-bold mb-4">My Assigned Complaints</h2>

      {complaints.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <p className="text-gray-600">No complaints assigned to you yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints?.map((complaint) => (
            <div
              key={complaint._id}
              className="cursor-pointer transform hover:scale-105 transition duration-300"
              onClick={() => navigate(`/complaint/${complaint._id}`)}
            >
              <ComplaintCard complaint={complaint} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewAssignedComplaints;
