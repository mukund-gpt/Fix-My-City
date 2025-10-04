import { Facebook, Instagram, LinkedIn, Twitter } from "@mui/icons-material";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-10">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Logo & Description */}
        <div>
          <h1 className="text-2xl font-bold text-yellow-400 mb-2">FixMyCity</h1>
          <p className="text-gray-400">
            Making our traveling circus city better, one complaint at a time.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="hover:text-yellow-400 transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/submit-complaint" className="hover:text-yellow-400 transition-colors">Submit Complaint</Link>
            </li>
            <li>
              <Link to="/my-complaints" className="hover:text-yellow-400 transition-colors">My Complaints</Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-yellow-400 transition-colors">Profile / Settings</Link>
            </li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Contact Us</h2>
          <p className="text-gray-400 mb-3">Email: support@fixmycity.com</p>
          <p className="text-gray-400 mb-3">Phone: +91 12345 67890</p>
          <div className="flex space-x-3 mt-2">
            <a href="#" className="hover:text-yellow-400 transition-colors"><Facebook /></a>
            <a href="#" className="hover:text-yellow-400 transition-colors"><Twitter /></a>
            <a href="#" className="hover:text-yellow-400 transition-colors"><Instagram /></a>
            <a href="#" className="hover:text-yellow-400 transition-colors"><LinkedIn /></a>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="bg-gray-800 text-gray-400 text-center py-4 mt-6">
        &copy; {new Date().getFullYear()} FixMyCity. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
