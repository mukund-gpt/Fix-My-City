import { Suspense, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import FilterComplaints from "./components/Filter.jsx";
import Footer from "./components/Footer.jsx";
import NavBar from "./components/Navbar.jsx";
import OthersProfile from "./components/OthersProfile.jsx";
import { adminTabs, staffTabs, userTabs } from "./constants/route.jsx";
import "./index.css";
import Login from "./pages/auth/Login.jsx";
import Profile from "./pages/auth/Profile.jsx";
import Register from "./pages/auth/Register.jsx";
import ComplaintDetail from "./pages/complaints/ComplaintDetail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MapComponent from "./pages/map/MapComponent.jsx";

function App() {
  const userRole = useSelector((state) => state.auth.userRole);
  // const userRole = "user"; // "admin" | "staff" | "user"
  const [tabs, setTabs] = useState(userTabs);
  useEffect(() => {
    let updatedtabs =
      userRole === "admin"
        ? adminTabs
        : userRole === "staff"
          ? staffTabs
          : userTabs;

    setTabs(updatedtabs);
    // console.log(updatedtabs);
  }, [userRole]);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <NavBar tabs={tabs} />
        <main className="flex-grow">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<OthersProfile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search" element={<FilterComplaints />} />
              <Route path="/complaint/:id" element={<ComplaintDetail />} />
              <Route path="/map" element={<MapComponent />} />
              {tabs.map((tab) => (
                <Route key={tab.path} path={tab.path} element={tab.element} />
              ))}
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
