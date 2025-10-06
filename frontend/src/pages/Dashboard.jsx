import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ConfigureSLA from "./admin/ConfigureSLA";
import ResolvedComplaints from "./admin/ResolvedComplaints";
import StaffSearch from "./admin/Search";
import UnresolvedComplaints from "./admin/UnresolvedComplaints";
import ViewAnalytics from "./admin/ViewAnalytics";

import { useState } from "react";
import ViewAssignedComplaints from "./staff/ViewAssignedComplaints";


const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeView, setActiveView] = useState(null);

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
        </div>
      )}


        {/* Staff Dashboard */}
        {user.role === "staff" && <ViewAssignedComplaints />}


      {/* Admin Dashboard */}
      {user.role === "admin" && (
        <>
          <StaffSearch />

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <Link
              to="/admin/manage-complaints"
              className="bg-indigo-600 text-white p-6 rounded-lg shadow hover:bg-indigo-700 transition text-center"
            >
              Resolved Complaints
            </Link>

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

          <div className="mt-6">
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
