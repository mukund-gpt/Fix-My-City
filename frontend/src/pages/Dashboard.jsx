import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // console.log(user);
  const { user } = useSelector((state) => state.auth);
  

  // console.log(user);
  // const user = {name: "John Doe", role: "citizen"}; // Mock user data for demonstration
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Please login to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}</h1>
      <p className="mb-8 text-gray-700">
        You are logged in as <span className="font-semibold">{user.role}</span>.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Citizen Dashboard */}
        {user.role === "citizen" && (
          <>
            <Link
              to="/citizen/submit-complaint"
              className="bg-blue-600 text-white p-6 rounded-lg shadow hover:bg-blue-700 transition text-center"
            >
              Submit Complaint
            </Link>
            <Link
              to="/citizen/my-complaints"
              className="bg-green-600 text-white p-6 rounded-lg shadow hover:bg-green-700 transition text-center"
            >
              My Complaints
            </Link>
            <Link
              to="/citizen/notifications"
              className="bg-purple-600 text-white p-6 rounded-lg shadow hover:bg-purple-700 transition text-center"
            >
              Notifications
            </Link>
          </>
        )}

        {/* Staff Dashboard */}
        {user.role === "staff" && (
          <>
            <Link
              to="/staff/all-complaints"
              className="bg-yellow-600 text-white p-6 rounded-lg shadow hover:bg-yellow-700 transition text-center"
            >
              View All Complaints
            </Link>
            <Link
              to="/staff/assign-complaints"
              className="bg-orange-600 text-white p-6 rounded-lg shadow hover:bg-orange-700 transition text-center"
            >
              Assign Complaints
            </Link>
            <Link
              to="/staff/resolution-notes"
              className="bg-red-600 text-white p-6 rounded-lg shadow hover:bg-red-700 transition text-center"
            >
              Add Resolution Notes
            </Link>
          </>
        )}

        {/* Admin Dashboard */}
        {user.role === "admin" && (
          <>
            <Link
              to="/admin/manage-complaints"
              className="bg-indigo-600 text-white p-6 rounded-lg shadow hover:bg-indigo-700 transition text-center"
            >
              Manage Complaints
            </Link>
            <Link
              to="/admin/view-analytics"
              className="bg-teal-600 text-white p-6 rounded-lg shadow hover:bg-teal-700 transition text-center"
            >
              View Analytics
            </Link>
            <Link
              to="/admin/configure-sla"
              className="bg-pink-600 text-white p-6 rounded-lg shadow hover:bg-pink-700 transition text-center"
            >
              Configure SLAs
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
