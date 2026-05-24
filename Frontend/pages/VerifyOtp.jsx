import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FaKey } from "react-icons/fa";
import { UserContext } from "../context/UserContext";
import { AppContext } from "../context/AppContext";

const VerifyOtp = () => {
  const { otpFor, email, setIsLogged } = useContext(AppContext);
  const { getUserData } = useContext(UserContext);
  const [otp, setOTP] = useState("");
  const [loading, setLoading] = useState(false); // New state for UX
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (otp === "") {
      toast.warning("Enter OTP");
      return;
    }

    setLoading(true); // Disable button during API call
    try {
      if (otpFor === "reset-otp") {
        const { data } = await axios.post(
          "http://localhost:8000/api/user/check-reset-otp",
          { otp, email },
          { withCredentials: true }
        );

        if (data.success === true) {
          toast.success(data.msg);
          setIsLogged(true);
          localStorage.setItem("isLogged", JSON.stringify(true));
          getUserData();
          setTimeout(() => navigate("/"), 2000);
          return;
        } else {
          toast.error(data.msg);
        }
      } else {
        const { data } = await axios.post(
          "http://localhost:8000/api/user/check-verify-otp",
          { otp, email },
          { withCredentials: true }
        );

        if (data.success === true) {
          toast.success(data.msg);

          setTimeout(() => navigate("/"), 2000);
          return;
        } else {
          toast.error(data.msg);
          return;
        }
      }
    } catch (error) {
      console.error("Frontend error:", error.response?.data || error.message);
      toast.error(error.response?.data?.msg || "Something went wrong");
      setTimeout(() => navigate("/login"), 2000);
    } finally {
      setLoading(false); // Re-enable button
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] ">
      <div className="bg-white shadow-lg rounded-xl px-8 py-10 w-[90%] max-w-md flex flex-col gap-6 border-t-4 border-b-4 border-gray-500">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          {otpFor === "reset-otp" ? "Reset Password OTP" : "Verify Email OTP"}
        </h2>
        <div className="relative">
          <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Enter OTP"
            className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
            value={otp}
            onChange={(e) => setOTP(e.target.value)}
            disabled={loading}
          />
        </div>
        <button
          onClick={handleSubmit}
          className="cursor-pointer bg-gray-500 text-white font-semibold py-2 px-6 rounded-md flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <FaKey className="text-lg" />
          Submit
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;
