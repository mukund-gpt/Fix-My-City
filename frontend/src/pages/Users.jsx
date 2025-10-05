import { useDispatch, useSelector } from "react-redux";

const Users = () => {
  // This component is for displaying all users
  // You can add functionality to fetch and display user details, manage users, etc.
  // Currently, it just displays a placeholder text
  // You can use useSelector to access user details if needed
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUserDetails());
  }, [dispatch]);

  return (
    <div>
      All Users
    </div>
  );
};

export default Users;