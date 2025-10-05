import { useParams } from "react-router-dom";
import samplemessage from "../../constants/sampleData.js";

const ComplaintDetail = () => {
  const { id } = useParams();
  const complaint = samplemessage.find((c) => c.id === parseInt(id));

  if (!complaint) {
    return <p className="p-6 text-center">Complaint not found!</p>;
  }

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
      <p className="text-gray-500 mb-2">Owner: {complaint.owner}</p>
      <p className="text-gray-500 mb-2">Department: {complaint.department}</p>
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
