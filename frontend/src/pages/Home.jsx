import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosinstance.js";
import ComplaintCard from "../components/ComplainCard.jsx";
import img1 from "./assets/img1.svg";
import img2 from "./assets/img2.svg";
import img3 from "./assets/img3.png";
import img4 from "./assets/img4.png";
import img5 from "./assets/img5.png";
import img6 from "./assets/img6.png";
import img7 from "./assets/img7.png";
import img8 from "./assets/img8.png";
import img9 from "./assets/img9.png";
import img10 from "./assets/img10.png";
import img11 from "./assets/img11.png";
import img12 from "./assets/img12.png";
import img13 from "./assets/img13.png";
const Home = () => {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await axiosInstance.get(`/complaints?limit=6`);
        setComplaints(res.data);
      } catch (error) {
        console.error(error);
        console.log("Error fetching the latest chronicles.");
      }
    };

    fetchComplaint();
  }, []);

  // Static Data for the "City Pulse" section (made up for dramatic effect)
  const totalOpen = 312;
  const totalResolved = 1890;
  const totalSubmissionsToday = 45;
  const resolutionRate = Math.round(
    (totalResolved / (totalResolved + totalOpen)) * 100
  );

  const images = [
    img1,
    img2,
    img3,
    img4,
    img5,
    img6,
    img7,
    img8,
    img9,
    img10,
    img11,
    img12,
    img13,
  ];

  return (
    <div className="bg-gray-900 min-h-screen font-sans text-white overflow-hidden">
      {/* Hero Section: The Grand Beacon */}
      <section className="relative bg-gradient-to-br from-blue-900 to-indigo-900 py-48 shadow-2xl overflow-hidden">
        {/* Abstract Background Animation */}
        <div className="absolute inset-0 opacity-20 animate-bg-pulse">
          <svg className="w-full h-full" viewBox="0 0 1440 320">
            <path
              fill="#4f46e5"
              fillOpacity="0.5"
              d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,122.7C960,139,1056,149,1152,144C1248,139,1344,117,1392,106.7L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            ></path>
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center transform translate-y-[-1rem] animate-fadeInDown">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-4 tracking-tight leading-none drop-shadow-lg">
            The <span className="text-yellow-400">Caravan Chronicle</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto font-light text-indigo-200">
            **Charting a course for civic repair.** Your voice is the compass,
            guiding our city's journey to a better future.
          </p>
          <Link
            to="/citizen/submit-complaint"
            className="inline-flex items-center space-x-3 bg-yellow-400 text-gray-900 font-black px-12 py-4 rounded-xl shadow-2xl shadow-yellow-500/50 hover:bg-yellow-300 transform hover:scale-105 transition duration-300 uppercase text-xl animate-pulseOnce"
          >
            <span>Lodge Your Report</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 transform rotate-[-10deg]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15l-5-5h10l-5 5z" />
            </svg>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full translate-y-1.5 overflow-hidden bg-white h-36 flex items-center">
          <style>
            {`
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-scroll {
        animation: scroll 25s linear infinite;
        display: flex;
      }
      .animate-scroll:hover {
        animation-play-state: paused;
      }
    `}
          </style>

          <div className="animate-scroll">
            <div className="flex shrink-0">
              {images.map((img, i) => (
                <img
                  key={`original-${i}`}
                  src={img}
                  alt="city-icon"
                  className="h-16 w-auto object-contain select-none mx-6"
                  draggable="false"
                />
              ))}
            </div>
            <div className="flex shrink-0">
              {images.map((img, i) => (
                <img
                  key={`duplicate-${i}`}
                  src={img}
                  alt="city-icon"
                  className="h-16 w-auto object-contain select-none mx-6"
                  draggable="false"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* City Pulse (The Creative Centerpiece) */}
      <section className="py-16 bg-gray-800  border-yellow-500/50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-white">
            The City Pulse: Real-Time Impact
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {/* Card 1: Resolved */}
            <div className="p-8 bg-blue-800 rounded-3xl shadow-xl border-b-4 border-green-400 text-center transform hover:scale-[1.05] transition duration-300 animate-slideInLeft">
              <p className="text-4xl font-black text-green-400">
                {totalResolved}
              </p>
              <p className="text-lg text-indigo-200 mt-2">Completed Journeys</p>
            </div>
            {/* Card 2: Open */}
            <div className="p-8 bg-blue-800 rounded-3xl shadow-xl border-b-4 border-red-400 text-center transform hover:scale-[1.05] transition duration-300 animate-slideInUp">
              <p className="text-4xl font-black text-red-400">{totalOpen}</p>
              <p className="text-lg text-indigo-200 mt-2">
                Tickets Awaiting Crew
              </p>
            </div>
            {/* Card 3: Rate */}
            <div className="p-8 bg-blue-800 rounded-3xl shadow-xl border-b-4 border-yellow-400 text-center transform hover:scale-[1.05] transition duration-300 animate-slideInUp">
              <p className="text-4xl font-black text-yellow-400">
                {resolutionRate}%
              </p>
              <p className="text-lg text-indigo-200 mt-2">
                Current Resolution Rate
              </p>
            </div>
            {/* Card 4: Daily Submissions (New Creative Stat) */}
            <div className="p-8 bg-blue-800 rounded-3xl shadow-xl border-b-4 border-purple-400 text-center transform hover:scale-[1.05] transition duration-300 animate-slideInRight">
              <p className="text-4xl font-black text-purple-400">
                {totalSubmissionsToday}
              </p>
              <p className="text-lg text-indigo-200 mt-2">New Reports Today</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section: The Compass Points */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-white border-b-2 border-yellow-500 pb-3">
            The Compass Points: Key Features
          </h2>
          <div className="grid lg:grid-cols-3 gap-12">
            {[
              {
                title: "Secure Manifests",
                icon: "🔒",
                desc: "Secure, role-based access for citizens, staff, and admins. Your data integrity is our highest priority.",
              },
              {
                title: "Geolocated Reports",
                icon: "📍",
                desc: "Pinpoint issues precisely using location services and maps, drastically reducing response times for field teams.",
              },
              {
                title: "Dynamic Lifecycle",
                icon: "⚡",
                desc: "Tickets automatically progress: OPEN → IN PROGRESS → RESOLVED. Real-time notifications keep everyone informed.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                // Elevated card with a diagonal split background and cool hover effect
                className="bg-gray-800 p-8 rounded-xl shadow-2xl border-2 border-indigo-700/50 hover:border-yellow-500 transition-all duration-500 transform hover:-translate-y-2 group"
              >
                <div className="text-6xl mb-4 transition-transform duration-500 group-hover:rotate-[10deg]">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-yellow-400">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
                <div className="h-1 w-1/4 mt-4 bg-yellow-500 group-hover:w-full transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Complaints: The Live Feed */}
      <section className="py-20 bg-gray-900 border-t border-gray-700">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-12 text-center text-white">
            Live Dispatch: Latest Reports
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {complaints && complaints.length > 0 ? (
              complaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="cursor-pointer transform hover:scale-[1.03] transition duration-300 shadow-xl hover:shadow-yellow-500/20 rounded-xl overflow-hidden animate-bounceIn"
                  onClick={() => navigate(`/complaint/${complaint._id}`)}
                >
                  {/* Assuming ComplaintCard is visually appealing, it will now inherit the dark theme context */}
                  <ComplaintCard complaint={complaint} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 bg-gray-800 rounded-xl shadow-inner border border-gray-700">
                <p className="text-xl font-semibold text-gray-400">
                  The ledger is quiet. Be the first to file a new chronicle! ✍️
                </p>
                <Link
                  to="/submit"
                  className="mt-4 inline-block text-yellow-500 hover:text-yellow-400 font-bold transition duration-300"
                >
                  Submit a Report &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action: The Final Destination */}
      <section className="py-20 bg-indigo-800 border-t-8 border-indigo-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Ready to embark?
          </h2>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
            Your credentials are your ticket to ride. Find your place in The
            Caravan Chronicle today.
          </p>
          <div className="space-x-6">
            <Link
              to="/register"
              className="bg-yellow-400 text-indigo-900 font-bold px-10 py-4 rounded-full shadow-2xl hover:bg-yellow-300 transform hover:scale-110 transition duration-300 text-lg uppercase tracking-wider"
            >
              Citizen Sign-up
            </Link>
            <Link
              to="/login"
              className="bg-gray-100 text-indigo-800 font-semibold px-10 py-4 rounded-full shadow-lg hover:bg-white transform hover:scale-110 transition duration-300 text-lg uppercase tracking-wider"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
