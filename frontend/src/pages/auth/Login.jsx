import { useState } from "react";
// Import icons for visual enhancement
import axiosInstance from "@/api/axiosinstance";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { userExist } from "@/redux/reducers/auth";
import { ArrowRight, Lock, Mail, Shield, User } from 'lucide-react';
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";


// Component for reusable, styled input fields
const FormInput = ({ icon: Icon, label, type, value, onChange, placeholder, required = true }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Icon className="w-4 h-4 mr-2 text-indigo-500" />
            {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition duration-300 outline-none shadow-sm placeholder-gray-400"
            required={required}
        />
    </div>
);
// --- END MOCK DEPENDENCIES ---


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Note: Redux state variables are destructured here but mocked below for runnability.
  let { user, userRole, loader, isAdmin } = useSelector((state) => state.auth); 

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { data } = await axiosInstance.post("/auth/login", {
        email,
        password,
        role,
      });
      
      // Dispatch user data and navigate
      dispatch(userExist(data));
      toast.success("Login successful!");
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Login failed. Check your email, password, and role.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const roles = [
    { value: 'citizen', label: 'Citizen', icon: User, color: 'text-indigo-500' },
    { value: 'staff', label: 'Staff', icon: Shield, color: 'text-teal-500' },
    { value: 'admin', label: 'Admin', icon: Lock, color: 'text-red-500' },
  ];


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      {/* Background overlay with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-gray-900 to-black opacity-90"></div>

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100 transform transition-all duration-500 hover:shadow-indigo-500/30">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-8">Sign in to your FixMyCity account.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          
            <FormInput
                icon={Mail}
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@user.com" // Placeholder suggestion for mock login
            />

          <FormInput
                icon={Lock}
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
            />

          {/* Role Selection - Styled as Segmented Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-indigo-500" />
                Select Your Role
            </label>
            <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
              {roles.map((r) => (
                <label
                  key={r.value}
                  className={`flex-1 text-center py-2 px-1 cursor-pointer transition-all duration-300 rounded-lg font-semibold text-sm ${
                    role === r.value
                      ? 'bg-white shadow-md text-gray-900 border border-gray-200'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <input
                    type="radio"
                    value={r.value}
                    checked={role === r.value}
                    onChange={(e) => setRole(e.target.value)}
                    className="hidden"
                  />
                  <r.icon className={`w-4 h-4 mx-auto mb-1 ${r.color}`} />
                    {r.label}
                </label>
              ))}
            </div>
          </div>


          {/* Primary Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center space-x-2 py-3 mt-6 rounded-xl font-bold transition duration-300 transform hover:scale-[1.01] shadow-lg ${
                isSubmitting 
                    ? 'bg-indigo-400 text-white cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/50'
            }`}
          >
            {isSubmitting ? 'Logging In...' : (
                <>
                    <ArrowRight className="w-5 h-5" />
                    <span>Log In</span>
                </>
            )}
          </button>

            <div className="flex items-center justify-between space-x-4">
                <div className="flex-grow h-px bg-gray-200"></div>
                <span className="text-gray-500 text-sm">OR</span>
                <div className="flex-grow h-px bg-gray-200"></div>
            </div>

          <GoogleLoginButton role={role} />

          <a
            href="/register"
            className="text-sm text-indigo-500 hover:text-indigo-700 hover:underline block text-center mt-6 transition duration-200"
          >
            Don't have an account? Register now!
          </a>
        </form>
      </div>
    </div>
  );
}
