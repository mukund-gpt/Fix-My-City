import {
  Assignment,
  Home,
  Notifications,
  People,
  ReportProblem,
  Settings
} from "@mui/icons-material";
import { lazy } from "react";

// Pages
const HomePage = lazy(() => import("../pages/Home.jsx"));
const DashboardPage = lazy(() => import("../pages/Dashboard.jsx"));
const ComplaintsPage = lazy(() => import("../pages/complaints/Complaints.jsx"));
const UsersPage = lazy(() => import("../pages/Users.jsx"));
const ReportsPage = lazy(() => import("../pages/Reports.jsx"));
const SettingsPage = lazy(() => import("../pages/auth/Settings.jsx"));
const NotificationsPage = lazy(() => import("../pages/Notifications.jsx"));
const ProfilePage = lazy(() => import("../pages/auth/Profile.jsx"));
const SubmitComplaintPage = lazy(()=> import ("../pages/complaints/SubmitComplaint.jsx"));
// Tabs with elements
export const adminTabs = [
  // { name: "Dashboard", path: "/admin/dashboard", icon: <Dashboard />, element: <DashboardPage role="admin" /> },
  { name: "Complaints", path: "/admin/complaints", icon: <ReportProblem />, element: <ComplaintsPage role="admin" /> },
  { name: "Users", path: "/admin/users", icon: <People />, element: <UsersPage /> },
  { name: "Reports", path: "/admin/reports", icon: <Assignment />, element: <ReportsPage /> },
  { name: "Settings", path: "/admin/settings", icon: <Settings />, element: <SettingsPage role="admin" /> },
  { name: "Notifications", path: "/admin/notifications", icon: <Notifications />, element: <NotificationsPage role="admin" /> }
];

export const staffTabs = [
  // { name: "Dashboard", path: "/staff/dashboard", icon: <Dashboard />, element: <DashboardPage role="staff" /> },
  { name: "Assigned Complaints", path: "/staff/complaints", icon: <ReportProblem />, element: <ComplaintsPage role="staff" /> },
  { name: "Settings", path: "/staff/settings", icon: <Settings />, element: <SettingsPage role="staff" /> },
  { name: "Notifications", path: "/staff/notifications", icon: <Notifications />, element: <NotificationsPage role="staff" /> }
];

export const userTabs = [
  { name: "Home", path: "/", icon: <Home />, element: <HomePage /> },
  // { name: "Dashboard", path: "/citizen/dashboard", icon: <Dashboard />, element: <DashboardPage role="user" /> },
  { name: "Submit Complaint", path: "citizen/submit-complaint", icon: <ReportProblem />, element: <SubmitComplaintPage role="user" type="submit" /> },
  { name: "My Complaints", path: "citizen/my-complaints", icon: <Assignment />, element: <ComplaintsPage role="user" type="my" /> },
  { name: "Notifications", path: "citizen/notifications", icon: <Notifications />, element: <NotificationsPage role="user" /> },
];
