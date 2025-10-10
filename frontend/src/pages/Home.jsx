import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosinstance.js";
import ComplaintCard from "../components/ComplainCard.jsx";
import { useSelector } from "react-redux";

// Images
import img1 from "./assets/img1.svg";
import img10 from "./assets/img10.png";
import img11 from "./assets/img11.png";
import img12 from "./assets/img12.png";
import img13 from "./assets/img13.png";
import img2 from "./assets/img2.svg";
import img3 from "./assets/img3.png";
import img4 from "./assets/img4.png";
import img5 from "./assets/img5.png";
import img6 from "./assets/img6.png";
import img7 from "./assets/img7.png";
import img8 from "./assets/img8.png";
import img9 from "./assets/img9.png";

import LiveStat from "./LiveStat.jsx";

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  // Two refs for Fog (bottom) and Birds (top)
  const fogRef = useRef(null);
  const birdsRef = useRef(null);
  const fogEffect = useRef(null);
  const birdsEffect = useRef(null);

  // Fetch latest complaints
  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await axiosInstance.get(`/complaints?limit=6`);
        setComplaints(res.data);
      } catch (error) {
        console.error(error);
        console.log("Error fetching the latest complaints.");
      }
    };
    fetchComplaint();
  }, []);

  // Initialize layered VANTA background (Fog + Birds)
  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });

    const initVanta = async () => {
      try {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js"
        );

        // Initialize Fog (bottom layer)
        if (!fogEffect.current && window.VANTA?.FOG && fogRef.current) {
          fogEffect.current = window.VANTA.FOG({
            el: fogRef.current,
            mouseControls: false,
            touchControls: false,
            gyroControls: false,
            highlightColor: 0x4aff,
            midtoneColor: 0xff0000,
            lowlightColor: 0x2d00ff,
            baseColor: 0xedebff,
            blurFactor: 0.6,
            zoom: 0.5,
            speed: 1,
          });
        }

        // Initialize Birds (top layer)
        if (!birdsEffect.current && window.VANTA?.BIRDS && birdsRef.current) {
          birdsEffect.current = window.VANTA.BIRDS({
            el: birdsRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            backgroundAlpha: 0.0, // transparent background so fog shows through
            color1: 0xff0000,
            color2: 0x00ffff,
            birdSize: 1.8,
            wingSpan: 25.0,
            speedLimit: 4.0,
            separation: 50.0,
            alignment: 50.0,
            cohesion: 40.0,
            quantity: 4.0,
          });
        }
      } catch (error) {
        console.error("Error initializing Vanta:", error);
      }
    };

    initVanta();

    return () => {
      if (fogEffect.current) fogEffect.current.destroy();
      if (birdsEffect.current) birdsEffect.current.destroy();
    };
  }, []);

  // Static city stats
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
      {/* 🌫️🕊️ Hero Section with layered Vanta effects */}
      <section className="relative py-48 overflow-hidden shadow-2xl">
        {/* Fog background (bottom) */}
        <div ref={fogRef} className="absolute inset-0 z-0" />
        {/* Birds overlay (top) */}
        <div ref={birdsRef} className="absolute inset-0 z-10" />

        {/* Hero content (over both effects) */}
        <div className="relative z-20 text-center container mx-auto px-6">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-4 tracking-tight leading-none drop-shadow-2xl">
            The <span className="text-yellow-400">Caravan Chronicle</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto font-light text-white drop-shadow-lg">
            <b>Charting a course for civic repair.</b> Your voice is the
            compass, guiding our city's journey to a better future.
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

        {/* Infinite Carousel */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden bg-white h-24 flex items-center z-30">
          <style>{`
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
          `}</style>
          <div className="animate-scroll">
            {[...images, ...images].map((img, i) => (
              <img
                key={i}
                src={img}
                alt="city-icon"
                className="h-16 w-auto object-contain select-none mx-6"
                draggable="false"
              />
            ))}
          </div>
        </div>
      </section>

      <LiveStat/>


      {/* Features */}
      <section className="py-10 bg-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-white border-b-4 border-yellow-500 pb-8">
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
                className="bg-gray-800 p-8 rounded-xl shadow-2xl border-2 border-indigo-700/50 hover:border-yellow-500 transition transform hover:-translate-y-2 group"
              >
                <div className="text-6xl mb-4 transition-transform group-hover:rotate-[10deg]">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-yellow-400">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Complaints */}
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
                  className="cursor-pointer hover:scale-[1.03] transition duration-300 shadow-xl hover:shadow-yellow-500/20 rounded-xl overflow-hidden"
                  onClick={() => navigate(`/complaint/${complaint._id}`)}
                >
                  <ComplaintCard complaint={complaint} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 bg-gray-800 rounded-xl shadow-inner border border-gray-700">
                <p className="text-xl font-semibold text-gray-400">
                  The ledger is quiet. Be the first to file a new chronicle! ✍️
                </p>
                <Link
                  to="/citizen/submit-complaint"
                  className="mt-4 inline-block text-yellow-500 hover:text-yellow-400 font-bold transition duration-300"
                >
                  Submit a Report &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>


      


      {/* Call to Action */}
      {!user && (
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
                Register
              </Link>
              <Link
                to="/login"
                className="bg-gray-100 text-indigo-800 font-semibold px-10 py-4 rounded-full shadow-lg hover:bg-white transform hover:scale-110 transition duration-300 text-lg uppercase tracking-wider"
              >
                Login
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
