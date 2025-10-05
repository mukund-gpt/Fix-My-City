import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import NavBar from "./components/Navbar.jsx";
import { adminTabs, staffTabs, userTabs } from './constants/route.jsx';
import "./index.css";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ComplaintDetail from "./pages/complaints/ComplaintDetail.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function App() {
  
  const userRole = "user"; // "admin" | "staff" | "user"
  const tabs = userRole === "admin" ? adminTabs : userRole === "staff" ? staffTabs : userTabs;
  return (
     <BrowserRouter>
      <NavBar tabs={tabs} />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/complaint/:id" element={<ComplaintDetail />} />
          {tabs.map(tab => (
              <Route key={tab.path} path={tab.path} element={tab.element} />
          ))}
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
