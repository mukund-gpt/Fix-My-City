import {
  Assignment,
  Dashboard,
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
const ComplaintsPage = lazy(() => import("../pages/Complaints.jsx"));
const UsersPage = lazy(() => import("../pages/Users.jsx"));
const ReportsPage = lazy(() => import("../pages/Reports.jsx"));
const SettingsPage = lazy(() => import("../pages/Settings.jsx"));
const NotificationsPage = lazy(() => import("../pages/Notifications.jsx"));
const ProfilePage = lazy(() => import("../pages/Profile.jsx"));

// Tabs with elements
export const adminTabs = [
  { name: "Dashboard", path: "/admin/dashboard", icon: <Dashboard />, element: <DashboardPage role="admin" /> },
  { name: "Complaints", path: "/admin/complaints", icon: <ReportProblem />, element: <ComplaintsPage role="admin" /> },
  { name: "Users", path: "/admin/users", icon: <People />, element: <UsersPage /> },
  { name: "Reports", path: "/admin/reports", icon: <Assignment />, element: <ReportsPage /> },
  { name: "Settings", path: "/admin/settings", icon: <Settings />, element: <SettingsPage role="admin" /> },
  { name: "Notifications", path: "/admin/notifications", icon: <Notifications />, element: <NotificationsPage role="admin" /> }
];

export const staffTabs = [
  { name: "Dashboard", path: "/staff/dashboard", icon: <Dashboard />, element: <DashboardPage role="staff" /> },
  { name: "Assigned Complaints", path: "/staff/complaints", icon: <ReportProblem />, element: <ComplaintsPage role="staff" /> },
  { name: "Settings", path: "/staff/settings", icon: <Settings />, element: <SettingsPage role="staff" /> },
  { name: "Notifications", path: "/staff/notifications", icon: <Notifications />, element: <NotificationsPage role="staff" /> }
];

export const userTabs = [
  { name: "Home", path: "/", icon: <Home />, element: <HomePage /> },
  { name: "Submit Complaint", path: "/submit-complaint", icon: <ReportProblem />, element: <ComplaintsPage role="user" type="submit" /> },
  { name: "My Complaints", path: "/my-complaints", icon: <Assignment />, element: <ComplaintsPage role="user" type="my" /> },
  { name: "Notifications", path: "/notifications", icon: <Notifications />, element: <NotificationsPage role="user" /> },
  { name: "Profile", path: "/profile", icon: <Settings />, element: <ProfilePage /> }
];
