import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetMyComplaintsQuery } from "../../redux/api/api";

const Complaints = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!user) return <div>Please log in to view your complaints.</div>;
  // console.log(user);
  const { data: complaints, error, isLoading } = useGetMyComplaintsQuery(user.token);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching complaints</div>;
  if (complaints.length === 0) return <div className="min-h-screen flex items-center justify-center">No complaints found. <button className="text-blue-500 underline" onClick={() => navigate('/citizen/submit-complaint')}>Submit a complaint</button></div>  
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {complaints?.map((complaint) => (
        <div
          key={complaint._id} // usually MongoDB uses _id
          className="bg-white border rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
          onClick={() => navigate(`/complaint/${complaint._id}`)}
        >
          <img
            src={complaint.photo}
            alt={complaint.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="font-bold text-xl mb-2">{complaint.title}</h3>
            <p className="text-gray-700 text-sm mb-2">{complaint.description}</p>
            <p className="text-gray-500 mb-2">Location: {complaint.location}</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${complaint.status === "OPEN"
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
  );
}
export default Complaints;