import { useDispatch, useSelector } from "react-redux";
import samplenotification from "../constants/sampleData";
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { userRole } = useSelector((state) => state.auth);
  
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUserDetails());
  }, [dispatch]);
  const handleMarkAsRead = (notificationId) => {
    // Logic to mark notification as read
  };
  const handleDeleteNotification = (notificationId) => {
    // Logic to delete notification
  };
  const fetchNotifications = () => {
    setNotifications([samplenotification]);
    // Logic to fetch notifications from the server
  };
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div>
      <h1>Notifications</h1>
      {/* Render notifications here */}
      {/* Example notification item */}
      <div>
        <p>Notification Title</p>
        <p>Notification Description</p>
        <button onClick={() => handleMarkAsRead(1)}>Mark as Read</button>
        <button onClick={() => handleDeleteNotification(1)}>Delete</button>
      </div>
      <button onClick={fetchNotifications}>Load More Notifications</button>
      Content
    </div>
  );
};

export default Notifications;