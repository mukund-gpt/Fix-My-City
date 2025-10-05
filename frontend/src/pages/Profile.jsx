import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetails } from "../redux/thunks/user";

const Profile = () => {
  
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUserDetails());
  }, [dispatch]);


  return (
    <div>
      <div>{user ? `Welcome, ${user.name}` : "Loading..."}</div>
      Profile
    </div>
  );
};

export default Profile;