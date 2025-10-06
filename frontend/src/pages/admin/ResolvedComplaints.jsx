import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosinstance";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ResolvedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state.auth.user.token);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchComplaints = async () => {
      if (!token) {
        toast.error("Please login to view Resolved complaints.");
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get("/admin/complaints/resolved", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setComplaints(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Error fetching unresolved complaints:", error);
        toast.error(
          error.response?.data?.message ||
            "Error fetching unresolved complaints"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [token]);

  if (!token) {
    return <div>Please login to view resolved complaints.</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Resolved Complaints</h2>

      {complaints.length === 0 ? (
        <p>No Resolved complaints found.</p>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div
              key={complaint._id}
              className="p-4 border rounded shadow"
              onClick={() => navigate(`/complaint/${complaint._id}`)}
            >
              <h3 className="font-bold">{complaint.title}</h3>
              <p>{complaint.description}</p>
              <p className="text-sm text-gray-600">
                Status: {complaint.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResolvedComplaints;
