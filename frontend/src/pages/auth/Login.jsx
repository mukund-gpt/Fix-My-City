import { useState } from "react";
// Import icons for visual enhancement
import axiosInstance from "@/api/axiosinstance";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { userExist } from "@/redux/reducers/auth";
import { ArrowRight, Lock, Mail, Shield, User } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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
    <label className="mb-1 flex items-center text-sm font-medium text-gray-700">
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
  const dispatch = useDispatch(); // Note: Redux state variables are destructured here but mocked below for runnability.
  let { user, userRole, loader, isAdmin } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post("/auth/login", {
        email,
        password,
        role,
      });
      if (data?.success === true) {
        dispatch(userExist(data));
        dispatch(userExist(data));
      }
      // Store user data and token in localStorage
      console.log(data?.role);

      // userRole = data?.role;
      // user = data.user;
      // loader = false;
      // isAdmin = data.role=='admin'?true:false;
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error logging in");
    }
  };

  const roles = [
    {
      value: "citizen",
      label: "Citizen",
      icon: User,
      color: "text-indigo-500",
    },
    { value: "staff", label: "Staff", icon: Shield, color: "text-teal-500" },
    { value: "admin", label: "Admin", icon: Lock, color: "text-red-500" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-white to-slate-100" />

      <div className="relative w-full max-w-lg transform rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl transition-all duration-500 hover:shadow-indigo-500/30 sm:p-10">
        <h2 className="mb-2 text-center text-3xl font-extrabold text-gray-800">
          Welcome Back
        </h2>
        <p className="mb-8 text-center text-gray-500">
          Sign in to your FixMyCity account.
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <FormInput
            icon={Mail}
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@user.com"
          />
          <FormInput
            icon={Lock}
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div>
            <p className="mb-2 flex items-center text-sm font-medium text-gray-700">
              <Shield className="mr-2 h-4 w-4 text-indigo-500" />
              Select Your Role
            </p>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1 shadow-inner">
              {roles.map((r) => (
                <label
                  key={r.value}
                  className={`flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-center text-sm font-semibold transition-all duration-300 ${
                    role === r.value
                      ? "border border-gray-200 bg-white text-gray-900 shadow-md"
                      : "text-gray-500 hover:bg-white/70 hover:text-gray-900"
                  }`}
                >
                  <input
                    type="radio"
                    value={r.value}
                    checked={role === r.value}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                  />
                  <r.icon className={`h-5 w-5 ${r.color}`} />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-6 flex w-full items-center justify-center space-x-2 rounded-xl py-3 font-bold shadow-lg transition duration-300 hover:scale-[1.01] ${
              isSubmitting
                ? "bg-indigo-400 text-white cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/50"
            }`}
          >
            {isSubmitting ? (
              "Logging In..."
            ) : (
              <>
                <ArrowRight className="w-5 h-5" />
                <span>Log In</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-500">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <GoogleLoginButton role={role} />
          <a
            href="/register"
            className="mt-6 block text-center text-sm text-indigo-500 transition duration-200 hover:text-indigo-700 hover:underline"
          >
            Don&apos;t have an account? Register now!
          </a>
        </form>
      </div>
    </div>
  );
}
