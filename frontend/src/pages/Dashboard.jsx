import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import UnresolvedComplaints from "./admin/UnresolvedComplaints";
import ResolvedComplaints from "./admin/ResolvedComplaints";
import ConfigureSLA from "./admin/ConfigureSLA";
import ViewAnalytics from "./admin/ViewAnalytics";
import { useState } from "react";
import ViewAssignedComplaints from "./staff/ViewAssignedComplaints";

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
  const [activeView, setActiveView] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}</h1>
      <p className="mb-8 text-gray-700">
        You are logged in as <span className="font-semibold">{user.role}</span>.
      </p>

      <div>
        {/* Citizen Dashboard */}
        {user.role === "citizen" && (
          <div className="grid md:grid-cols-3 gap-6">
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
          </div>
        )}

        {/* Staff Dashboard */}
        {user.role === "staff" && <ViewAssignedComplaints />}

        {/* Admin Dashboard */}
        {user.role === "admin" && (
          <div className="grid md:grid-cols-4 gap-3">
            <button
              onClick={() => setActiveView("unresolved")}
              className="bg-indigo-600 text-white p-6 rounded-lg shadow hover:bg-indigo-700 transition text-center"
            >
              Unresolved Complaints
            </button>
            <button
              onClick={() => setActiveView("resolved")}
              className="bg-indigo-600 text-white p-6 rounded-lg shadow hover:bg-indigo-700 transition text-center"
            >
              Resolved Complaints
            </button>
            <button
              onClick={() => setActiveView("analytics")}
              className="bg-teal-600 text-white p-6 rounded-lg shadow hover:bg-teal-700 transition text-center"
            >
              View Analytics
            </button>
            <button
              onClick={() => setActiveView("sla")}
              className="bg-pink-600 text-white p-6 rounded-lg shadow hover:bg-pink-700 transition text-center"
            >
              Configure SLAs
            </button>
          </div>
        )}
      </div>
      <div>
        {activeView === "unresolved" && (
          <UnresolvedComplaints onBack={() => setActiveView(null)} />
        )}
        {activeView === "resolved" && (
          <ResolvedComplaints onBack={() => setActiveView(null)} />
        )}
        {activeView === "analytics" && (
          <ViewAnalytics onBack={() => setActiveView(null)} />
        )}
        {activeView === "sla" && (
          <ConfigureSLA onBack={() => setActiveView(null)} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
