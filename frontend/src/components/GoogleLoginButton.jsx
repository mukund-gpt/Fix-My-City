import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosinstance";
import { useNavigate } from "react-router-dom";
import { userExist } from "../redux/reducers/auth";
import { useDispatch } from "react-redux";

export default function GoogleLoginButton({ role }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
      if (res.data.success === true) {
        dispatch(userExist(res.data));
        toast.success("Login successful!");
        navigate("/");
      } else return toast.error(res.data.message || "Google login failed");
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error logging in with Google");
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
