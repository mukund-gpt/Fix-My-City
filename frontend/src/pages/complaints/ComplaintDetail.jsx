import { useParams } from "react-router-dom";
import samplemessage from "../../constants/sampleData.js";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosinstance.js";

const ComplaintDetail = () => {
  const { id } = useParams();
  // const complaint = samplemessage.find((c) => c.id === parseInt(id));
  const [complaint, setComplaint] = useState();
  const token = useSelector((state) => state.auth.user.token);

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!token) {
        toast.error("Please login to view unresolved complaints.");
        return;
      }

      try {
        const res = await axiosInstance.get(`/complaints/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setComplaint(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Error fetching unresolved complaints:", error);
        toast.error(error.message || "Error fetching complaint");
      }
    };

    fetchComplaint();
  }, [token]);

  if (!complaint) {
    return <p className="p-6 text-center">Complaint not found!</p>;
  }
  console.log(complaint);

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-4">{complaint.title}</h1>
      <img
        src={complaint.photo}
        alt={complaint.title}
        className="w-full h-64 object-cover mb-4 rounded"
      />
      <p className="mb-2 text-gray-700">{complaint.description}</p>
      <p className="text-gray-500 mb-2">Location: {complaint.location}</p>
      <p className="text-gray-500 mb-2">Owner: {complaint.citizen.name}</p>
      <p className="text-gray-500 mb-2">
        Assigned To:{" "}
        {complaint.assignedTo && complaint.assignedTo.length > 0
          ? complaint.assignedTo.map((staff) => staff.name).join(", ")
          : "Not assigned"}
      </p>
      <p
        className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${
          complaint.status === "OPEN"
            ? "bg-red-500"
            : complaint.status === "IN_PROGRESS"
            ? "bg-yellow-500"
            : "bg-green-500"
        }`}
      >
        Status: {complaint.status}
      </p>
    </div>
  );
};

export default ComplaintDetail;
