import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ComplaintCard from "../components/ComplainCard.jsx";
import axiosInstance from "../api/axiosinstance.js";
import toast from "react-hot-toast";

const Home = () => {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await axiosInstance.get(`/complaints`);
        setComplaints(res.data);
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Error fetching complaint");
      }
    };

    fetchComplaint();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Welcome to{" "}
            <span className="text-yellow-400">The Caravan Chronicle</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Submit complaints, track progress, and stay updated on civic issues
            in your city.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "User Registration & Login",
                desc: "Citizens, staff, and admins can create secure accounts or log in via email/Google. Role-based dashboards are provided after login.",
              },
              {
                title: "Complaint Submission",
                desc: "Citizens can report issues such as road damage, water leakage, or uncollected garbage, including title, description, location, and photo uploads.",
              },
              {
                title: "Ticket Lifecycle",
                desc: "Each complaint moves through OPEN → IN PROGRESS → RESOLVED → CLOSED. Citizens receive real-time status updates.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gradient-to-tr from-gray-800 to-gray-900 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2"
              >
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboards Section */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Role-Based Dashboards
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Citizen Portal",
                desc: "Submit complaints, view your submitted tickets, track progress, and receive notifications about status changes.",
              },
              {
                title: "Municipal Dashboard",
                desc: "Staff can view, filter, and search complaints, assign them to field teams, update status, and add resolution notes.",
              },
              {
                title: "Admin Dashboard",
                desc: "Admins oversee everything, configure SLAs, manage users, and view analytics across all complaints and teams.",
              },
            ].map((dash, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2"
              >
                <h3 className="text-xl font-semibold mb-3">{dash.title}</h3>
                <p className="text-gray-700">{dash.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Complaints */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Recent Complaints
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints?.map((complaint) => (
              <div
                key={complaint._id}
                className="cursor-pointer transform hover:scale-105 transition duration-300"
                onClick={() => navigate(`/complaint/${complaint._id}`)}
              >
                <ComplaintCard complaint={complaint} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
