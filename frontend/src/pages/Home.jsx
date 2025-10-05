import Link from "@mui/material/Link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import samplemessage from "../constants/sampleData.js";
const Home = () => {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();
  // useSelector and useDispatch can be used here if you want to connect to Redux store
  const { user, userRole, loader, isAdmin } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    // Load data from JSON
    setComplaints(samplemessage);
  }, []);

  return (
      <div className="p-6 bg-gray-100 min-h-screen">
          {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to The Caravan Chronicle
          </h1>
          <p className="text-lg md:text-xl mb-6">
            Submit complaints, track progress, and stay updated on civic issues
            in your city.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 font-semibold px-6 py-3 rounded shadow hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* User Registration */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">
                User Registration & Login
              </h3>
              <p>
                Citizens, staff, and admins can create secure accounts or log in
                via email/Google. Role-based dashboards are provided after
                login.
              </p>
            </div>

            {/* Complaint Submission */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">
                Complaint Submission
              </h3>
              <p>
                Citizens can report issues such as road damage, water leakage,
                or uncollected garbage, including title, description, location,
                and photo uploads.
              </p>
            </div>

            {/* Ticket Lifecycle */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">Ticket Lifecycle</h3>
              <p>
                Each complaint moves through OPEN → IN PROGRESS → RESOLVED →
                CLOSED. Citizens receive real-time status updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboards Section */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Role-Based Dashboards
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Citizen */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">Citizen Portal</h3>
              <p>
                Submit complaints, view your submitted tickets, track progress,
                and receive notifications about status changes.
              </p>
            </div>

            {/* Staff */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">
                Municipal Dashboard
              </h3>
              <p>
                Staff can view, filter, and search complaints, assign them to
                field teams, update status, and add resolution notes.
              </p>
            </div>

            {/* Admin */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">Admin Dashboard</h3>
              <p>
                Admins oversee everything, configure SLAs, manage users, and
                view analytics across all complaints and teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="mb-6 text-lg">
          Register today and start tracking civic issues in your area.
        </p>
        <Link
          to="/register"
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded shadow hover:bg-blue-700 transition"
        >
          Register Now
        </Link>
      </section>
      <h1 className="text-3xl font-bold mb-6 text-center">Recent Complaints</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(complaints) && complaints?.map((complaint) => (
          <div
            key={complaint.id}
                className="bg-white border rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                onClick={() => navigate(`/complaint/${complaint.id}`)} 
          >
            {/* Complaint Photo */}
            <img
              src={complaint.photo}
              alt={complaint.title}
              className="w-full h-48 object-cover"
            />

            <div className="p-4">
              {/* Title */}
              <h3 className="font-bold text-xl mb-2">{complaint.title}</h3>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-2">{complaint.description}</p>

              {/* Location */}
              <p className="text-gray-500 mb-2">Location: {complaint.location}</p>

              {/* Status */}
              <span
                className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${
                  complaint.status === "OPEN"
                    ? "bg-red-500"
                    : complaint.status === "IN_PROGRESS"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              >
                {complaint.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
