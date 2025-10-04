import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import NavBar from "./components/Navbar.jsx";
import { adminTabs, staffTabs, userTabs } from './constants/route.jsx';
import ComplaintDetail from "./pages/ComplaintDetail.jsx";

function App() {
  
  const userRole = "user"; // "admin" | "staff" | "user"
  const tabs = userRole === "admin" ? adminTabs : userRole === "staff" ? staffTabs : userTabs;
  return (
     <BrowserRouter>
      <NavBar tabs={tabs} />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
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
