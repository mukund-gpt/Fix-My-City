import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosinstance";
import { useNavigate } from "react-router-dom";

export default function GoogleLoginButton({ role }) {
  const navigate = useNavigate();
  const handleLoginSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;

    // Decode token
    const user = jwtDecode(token);
    // console.log("Google user info:", user);

    try {
      const res = await axiosInstance.post("/auth/google-login", {
        token,
        role,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      console.log(error.response);
      toast.error(
        error.response?.data?.message || "Error logging in with Google"
      );
    }
  };

  const handleLoginError = () => {
    toast.error("Google login failed");
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginError} />
    </div>
  );
}
