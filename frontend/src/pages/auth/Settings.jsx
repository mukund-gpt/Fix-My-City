import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetails } from "../../redux/thunks/user";

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUserDetails());
  }, [dispatch]);

  return <div>Settings</div>;
};

export default Settings;
