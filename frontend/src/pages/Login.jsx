import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosinstance";
import toast from "react-hot-toast";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post("/auth/login", {
        email,
        password,
        role,
      });
      localStorage.setItem("token", data.token);
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error logging in");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">Role</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="citizen"
                  checked={role === "citizen"}
                  onChange={(e) => setRole(e.target.value)}
                  className="text-blue-500 focus:ring-blue-400"
                />
                <span>Citizen</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="staff"
                  checked={role === "staff"}
                  onChange={(e) => setRole(e.target.value)}
                  className="text-blue-500 focus:ring-blue-400"
                />
                <span>Staff</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="admin"
                  checked={role === "admin"}
                  onChange={(e) => setRole(e.target.value)}
                  className="text-blue-500 focus:ring-blue-400"
                />
                <span>Admin</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Login
          </button>
          <GoogleLoginButton role={role} />
          <a
            href="/register"
            className="text-sm text-blue-500 hover:underline block text-center"
          >
            Don't have an account? Register
          </a>
        </form>
      </div>
    </div>
  );
}
