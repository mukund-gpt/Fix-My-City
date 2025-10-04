import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import samplemessage from "../constants/sampleData.js";

const Home = () => {
  const [complaints, setComplaints] = useState([]);
    const navigate = useNavigate();
  useEffect(() => {
    // Load data from JSON
    setComplaints(samplemessage);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Recent Complaints</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complaints.map((complaint) => (
          <div
            key={complaint.id}
                className="bg-white border rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                onClick={() => navigate(`/complaint/${complaint.id}`)} 
          >
            {/* Complaint Photo */}
            <img
              src={complaint.photo}
              alt={complaint.title}
              className="w-full h-48 object-cover"
            />

            <div className="p-4">
              {/* Title */}
              <h3 className="font-bold text-xl mb-2">{complaint.title}</h3>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-2">{complaint.description}</p>

              {/* Location */}
              <p className="text-gray-500 mb-2">Location: {complaint.location}</p>

              {/* Status */}
              <span
                className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${
                  complaint.status === "OPEN"
                    ? "bg-red-500"
                    : complaint.status === "IN_PROGRESS"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              >
                {complaint.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
