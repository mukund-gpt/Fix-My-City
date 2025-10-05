import { useDispatch, useSelector } from "react-redux";

const Settings = () => {
  // This component is for user settings
  // You can add functionality to update user preferences, change password, etc.
  // Currently, it just displays a placeholder text

  // You can use useSelector to access user details if needed
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUserDetails());
  }, [dispatch]);
  // You can also add functionality to update user settings here
  // const handleUpdateSettings = () => {
  //   // Logic to update user settings
  // };

  return (
    <div>
          Settings
          
    </div>
  );
};

export default Settings;