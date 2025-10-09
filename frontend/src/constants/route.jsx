import MapComponent from "@/pages/map/MapComponent.jsx";
import {
  Assignment,
  DashboardCustomize,
  Home,
  Notifications,
  People,
  ReportProblem,
} from "@mui/icons-material";
import MapIcon from "@mui/icons-material/Map";
import { lazy } from "react";

// Pages
const HomePage = lazy(() => import("../pages/Home.jsx"));
const DashboardPage = lazy(() => import("../pages/Dashboard.jsx"));
const ComplaintsPage = lazy(() => import("../pages/complaints/Complaints.jsx"));
const UsersPage = lazy(() => import("../pages/Users.jsx"));
const ReportsPage = lazy(() => import("../pages/Reports.jsx"));
const NotificationsPage = lazy(() => import("../pages/Notifications.jsx"));
const SubmitComplaintPage = lazy(() =>
  import("../pages/complaints/SubmitComplaint.jsx")
);
// Tabs with elements
export const adminTabs = [
  { name: "Home", path: "/", icon: <Home />, element: <HomePage /> },
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <DashboardCustomize />,
    element: <DashboardPage role="admin" />,
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: <People />,
    element: <UsersPage />,
  },
  {
    name: "Reports",
    path: "/admin/reports",
    icon: <Assignment />,
    element: <ReportsPage />,
  },
  {
    name: "Heatmap",
    path: "/map",
    icon: <MapIcon />,
    element: <MapComponent />,
  },
  {
    name: "Notifications",
    path: "/admin/notifications",
    icon: <Notifications />,
    element: <NotificationsPage role="admin" />,
  },
];

export const staffTabs = [
  { name: "Home", path: "/", icon: <Home />, element: <HomePage /> },
  {
    name: "Assigned Complaints",
    path: "/dashboard",
    icon: <ReportProblem />,
    element: <ComplaintsPage role="staff" />,
  },
  {
    name: "Heatmap",
    path: "/map",
    icon: <MapIcon />,
    element: <MapComponent />,
  },
  {
    name: "Notifications",
    path: "/staff/notifications",
    icon: <Notifications />,
    element: <NotificationsPage role="staff" />,
  },
];

export const userTabs = [
  { name: "Home", path: "/", icon: <Home />, element: <HomePage /> },
  {
    name: "Submit Complaint",
    path: "citizen/submit-complaint",
    icon: <ReportProblem />,
    element: <SubmitComplaintPage role="user" type="submit" />,
  },
  {
    name: "My Complaints",
    path: "citizen/my-complaints",
    icon: <Assignment />,
    element: <ComplaintsPage role="user" type="my" />,
  },
  {
    name: "Heatmap",
    path: "/map",
    icon: <MapIcon />,
    element: <MapComponent />,
  },
  {
    name: "Notifications",
    path: "citizen/notifications",
    icon: <Notifications />,
    element: <NotificationsPage role="user" />,
  },
];
