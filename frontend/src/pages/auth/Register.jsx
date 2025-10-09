import { useState } from "react";
// Import icons for visual enhancement
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { ArrowRight, Lock, Mail, Shield, User } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosinstance";

const roles = [
  { value: "citizen", label: "Citizen", icon: User, color: "text-indigo-500" },
  { value: "staff", label: "Staff", icon: Shield, color: "text-teal-500" },
  { value: "admin", label: "Admin", icon: Lock, color: "text-red-500" },
];

// Component for reusable, styled input fields
const FormInput = ({
  icon: Icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  required = true,
}) => (
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
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition duration-300 outline-none shadow-sm placeholder-gray-400"
      required={required}
    />
  </div>
);

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const { data } = await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      if (data?.success === true) {
        console.log(data);
        toast.success("Registration successful! Please login.");
        navigate("/login");
      } else {
        toast.error(data?.message || "Error registering");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error registering");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      {/* Background overlay with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-gray-900 to-black opacity-90"></div>

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100 transform transition-all duration-500 hover:shadow-indigo-500/30">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
          Join FixMyCity
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Create your account to start reporting issues.
        </p>

        <form onSubmit={handleRegister} className="space-y-6">
          <FormInput
            icon={User}
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />

          <FormInput
            icon={Mail}
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@city.gov"
          />

          <FormInput
            icon={Lock}
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <FormInput
            icon={Lock}
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
                      ? "bg-white shadow-md text-gray-900 border border-gray-200"
                      : "text-gray-500 hover:text-gray-900"
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
          {/* Primary Register Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center space-x-2 py-3 mt-6 rounded-xl font-bold transition duration-300 transform hover:scale-[1.01] shadow-lg ${
              isSubmitting
                ? "bg-green-400 text-white cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700 shadow-green-500/50"
            }`}
          >
            {isSubmitting ? (
              "Registering..."
            ) : (
              <>
                <ArrowRight className="w-5 h-5" />
                <span>Register Account</span>
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
            href="/login"
            className="text-sm text-indigo-500 hover:text-indigo-700 hover:underline block text-center mt-6 transition duration-200"
          >
            Already have an account? Log in now!
          </a>
        </form>
      </div>
    </div>
  );
}
