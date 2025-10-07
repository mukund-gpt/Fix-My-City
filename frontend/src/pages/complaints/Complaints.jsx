import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ComplaintCard from "../../components/ComplainCard";
import { useGetMyComplaintsQuery } from "../../redux/api/api";

const Complaints = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!user) return <div>Please log in to view your complaints.</div>;
  // console.log(user);
  const {
    data: complaints,
    error,
    isLoading,
  } = useGetMyComplaintsQuery(user.token);
  console.log(complaints);
  console.log(user.token);

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        Error fetching complaints
        {console.log(error)}
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {complaints?.map((complaint) => (
        <div
          key={complaint._id}
          className="cursor-pointer"
          onClick={() => navigate(`/complaint/${complaint._id}`)}
        >
          <ComplaintCard  complaint={complaint} />
        </div>
      ))}
      
    </div>
  );
};
export default Complaints;
