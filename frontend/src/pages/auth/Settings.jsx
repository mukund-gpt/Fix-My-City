import { useDispatch, useSelector } from "react-redux";

const Settings = () => {
 
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUserDetails());
  }, [dispatch]);
 

  return (
    <div>
          Settings
          
    </div>
  );
};

export default Settings;