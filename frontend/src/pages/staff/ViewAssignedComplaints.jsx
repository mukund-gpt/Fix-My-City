import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import axiosInstance from "../../api/axiosinstance";
import { useNavigate } from "react-router-dom";

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
        <div className="space-y-2">
          {complaints.map((complaint) => (
            <div
              key={complaint._id}
              onClick={() => navigate(`/complaint/${complaint._id}`)}
              className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-gray-800">
                  {complaint.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    complaint.status === "RESOLVED"
                      ? "bg-green-100 text-green-800"
                      : complaint.status === "IN_PROGRESS"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {complaint.status}
                </span>
              </div>

              <p className="text-gray-700 mb-3">{complaint.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewAssignedComplaints;
