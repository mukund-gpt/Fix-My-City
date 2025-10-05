import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useGetMyComplaintsQuery } from "../../redux/api/api";

const Complaints = () => {
  const { user} = useSelector((state) => state.auth);
  // console.log(user);
  const [complaints, setComplaints] = useState([]);
  const { data, error, isLoading } = useGetMyComplaintsQuery(user.role);

  useEffect(() => {
    if (data) {
      setComplaints(data);
    }
  }, [data]);

  return (
    <div>
      {complaints?.map((complaint, index) => (
        <div key={index}>
          <h3>{complaint.title}</h3>
          <p>{complaint.description}</p>
        </div>
      ))}
    </div>
  );
};

export default Complaints;