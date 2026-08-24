import { useState } from "react";
import { Link } from "react-router-dom";

// Importing icons for better visual differentiation
import AnalyticsIcon from "@mui/icons-material/Analytics";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ListAltIcon from "@mui/icons-material/ListAlt";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import SendIcon from "@mui/icons-material/Send";
import SettingsIcon from "@mui/icons-material/Settings";
import { useSelector } from "react-redux";
import ConfigureSLA from "./admin/ConfigureSLA";
import ResolvedComplaints from "./admin/ResolvedComplaints";
import UnresolvedComplaints from "./admin/UnresolvedComplaints";
import ViewAnalytics from "./admin/ViewAnalytics";
import ViewAssignedComplaints from "./staff/ViewAssignedComplaints";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [activeView, setActiveView] = useState(null);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <p className="rounded-xl border border-yellow-300 bg-white p-8 text-xl shadow-lg">
          Please login to access your dashboard.
        </p>
      </div>
    );
  }

  // Helper component for creating interactive cards/buttons
  const DashboardCard = ({ title, icon, color, onClick, isActive, path }) => {
    const baseClasses = `
      flex flex-col items-center justify-center p-6 sm:p-8 
      rounded-xl shadow-xl transition-all duration-300 transform 
      cursor-pointer border-2 font-bold text-center h-full
    `;

    // Determine specific styling based on role/type
    let typeClasses = `bg-white text-slate-800 border-slate-200 hover:-translate-y-1 hover:border-yellow-400 hover:shadow-lg`;
    let iconColor = color;

    if (path) {
      // This is a Link for Citizen
      typeClasses = `${color} text-white border-transparent hover:scale-[1.03] hover:shadow-yellow-500/50`;
    } else if (isActive) {
      // This is an active Admin button
      typeClasses = `bg-yellow-400 text-gray-900 border-yellow-500 shadow-2xl shadow-yellow-500/30 ring-4 ring-yellow-400/50`;
      iconColor = "text-gray-900"; // Black icon on yellow background
    }

    const content = (
      <div className={`${baseClasses} ${typeClasses}`}>
        <div className={`text-4xl mb-3 ${iconColor}`}>{icon}</div>
        <span className="text-lg">{title}</span>
      </div>
    );

    if (path) {
      return (
        <Link to={path} className="block">
          {content}
        </Link>
      );
    }

    return (
      <button onClick={onClick} className="block w-full">
        {content}
      </button>
    );
  };

  return (
    // CHANGE: Dark background and padding for aesthetic
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* --- Dashboard Layouts --- */}

        {/* Citizen Dashboard */}
        {user.role === "citizen" && (
          <div className="grid md:grid-cols-3 gap-6">
            <DashboardCard
              title="Submit New Complaint"
              icon={<SendIcon fontSize="inherit" />}
              path="/citizen/submit-complaint"
              color="bg-red-700 hover:bg-red-600"
            />
            <DashboardCard
              title="View My Complaints"
              icon={<ListAltIcon fontSize="inherit" />}
              path="/citizen/my-complaints"
              color="bg-green-700 hover:bg-green-600"
            />
            <DashboardCard
              title="Notifications"
              icon={<NotificationsActiveIcon fontSize="inherit" />}
              path="/citizen/notifications"
              color="bg-purple-700 hover:bg-purple-600"
            />
          </div>
        )}

        {/* Staff Dashboard */}
        {user.role === "staff" && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-indigo-700 text-indigo-400 flex items-center">
              <AssignmentIcon className="mr-3 text-3xl" />
              Assigned Complaint Queue
            </h2>
            {/* Staff view is always visible and doesn't use the sub-view area */}
            <ViewAssignedComplaints />
          </div>
        )}

        {/* Admin Dashboard */}
        {user.role === "admin" && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-indigo-700 text-indigo-400 flex items-center">
              <AssignmentTurnedInIcon className="mr-3 text-3xl" />
              Admin Command Center
            </h2>
            <div className="grid md:grid-cols-4 gap-4 mb-10">
              <DashboardCard
                title="Unresolved Complaints"
                icon={<PendingActionsIcon fontSize="inherit" />}
                onClick={() => setActiveView("unresolved")}
                isActive={activeView === "unresolved"}
                color="text-red-400"
              />
              <DashboardCard
                title="Resolved Complaints"
                icon={<CheckCircleIcon fontSize="inherit" />}
                onClick={() => setActiveView("resolved")}
                isActive={activeView === "resolved"}
                color="text-green-400"
              />
              <DashboardCard
                title="View Analytics"
                icon={<AnalyticsIcon fontSize="inherit" />}
                onClick={() => setActiveView("analytics")}
                isActive={activeView === "analytics"}
                color="text-teal-400"
              />
              <DashboardCard
                title="Configure SLAs"
                icon={<SettingsIcon fontSize="inherit" />}
                onClick={() => setActiveView("sla")}
                isActive={activeView === "sla"}
                color="text-pink-400"
              />
            </div>

            {/* Sub-view Area */}
            {activeView && (
              <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                {/* The onBack prop now allows sub-components to dismiss themselves */}
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
            )}
            {!activeView && (
              <div className="mt-8 p-12 text-center text-gray-400 border border-gray-700 rounded-xl">
                <p className="text-lg">
                  Select a command from above to manage the system.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
