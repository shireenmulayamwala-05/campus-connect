import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaKey } from "react-icons/fa";
import { UserContext } from "../context/UserContext";
import { AppContext } from "../context/AppContext";

const Login = () => {
  const [status, setStatus] = useState("Sign Up");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { SetEmail, setOtpFor, setIsLogged } = useContext(AppContext);
  const { getUserData } = useContext(UserContext);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  // Cleanup to prevent navigation after unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setUserName(newStatus === "Sign Up" ? userName : "");
    setMobileNo(newStatus === "Sign Up" ? mobileNo : "");
    setPassword(newStatus !== "Forget Password" ? password : "");
    setEmail("");
  };

  const handleSubmit = async () => {
    if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true);
    try {
      if (status === "Sign Up") {
        if (
          !userName ||
          !email ||
          !password ||
          (!mobileNo && mobileNo.length === 10)
        ) {
          toast.error("Please enter every field");
          return;
        }

        const { data } = await axios.post(
          "http://localhost:8000/api/user/register",
          { userName, email, password, mobileNo },
          { withCredentials: true }
        );

        if (data.success) {
          toast.success("Account created successfully");
          setIsLogged(true);
          localStorage.setItem("isLogged", JSON.stringify(true));

          getUserData();
          navigate("/");
        } else {
          console.log("Registration response:", JSON.stringify(data, null, 2));
          switch (data.msg) {
            case "User already exists with this email":
              toast.error(data.msg);
              break;
            case "Invalid email format":
              toast.warning(data.msg);
              break;
            case "Mobile number must be 10 digits":
              toast.warning(data.msg);
              break;
            case "Password must be strong (min 8 chars, 1 uppercase, 1 number, 1 symbol)":
              toast.warning(data.msg);
              break;
            default:
              toast.error(data.msg || "Registration failed");
          }
        }
      } else if (status === "Sign In") {
        if (email === "" || password === "") {
          toast.warning("Please enter every field");
          return;
        }
        const { data } = await axios.post(
          "http://localhost:8000/api/user/login",
          { email, password },
          { withCredentials: true }
        );
        if (data.success) {
          toast.success(data.msg);
          setIsLogged(true);
          localStorage.setItem("isLogged", JSON.stringify(true));
          getUserData();
          navigate("/");
        } else {
          toast.error(data.msg || "Invalid email or password");
        }
      } else if (status === "Forget Password") {
        if (email === "") {
          toast.warning("Enter email");
          return;
        }
        const { data } = await axios.post(
          "http://localhost:8000/api/user/reset-otp",
          { email },
          { withCredentials: true }
        );
        if (data.success) {
          SetEmail(email);
          setOtpFor("reset-otp");
          toast.success(data.msg);
          navigate("/verify-otp");
        } else {
          toast.error(data.msg);
        }
      }
    } catch (error) {
      console.error("Frontend error:", error.response?.data || error.message);
      toast.error(error.response?.data?.msg || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="bg-white shadow-xl rounded-xl p-8 w-[90%] max-w-md flex flex-col gap-8 border-t-4 border-b-4 border-blue-500">
        <h2 className="text-3xl font-bold text-blue-900 text-center tracking-wide">
          {status}
        </h2>

        {status === "Sign Up" && (
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
            <input
              type="text"
              placeholder="Enter Username"
              className="border border-blue-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
        )}

        <div className="relative">
          <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
          <input
            type="email"
            placeholder="Enter Email"
            className="border border-blue-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {status !== "Forget Password" && (
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
            <input
              type="password"
              placeholder="Enter Password"
              className="border border-blue-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        {status === "Sign Up" && (
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
            <input
              type="text"
              placeholder="Enter Mobile Number"
              className="border border-blue-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between text-sm text-blue-700 gap-4">
          {status !== "Forget Password" && (
            <p
              onClick={() => handleStatusChange("Forget Password")}
              className="hover:text-violet-600 cursor-pointer transition-colors"
            >
              Forgot your password?
            </p>
          )}
          {status !== "Sign In" && (
            <p
              onClick={() => handleStatusChange("Sign In")}
              className="hover:text-violet-600 cursor-pointer transition-colors"
            >
              Already have an account?
            </p>
          )}
          {status !== "Sign Up" && (
            <p
              onClick={() => handleStatusChange("Sign Up")}
              className="hover:text-violet-600 cursor-pointer transition-colors"
            >
              Create Account
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full cursor-pointer bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:from-blue-600 hover:to-violet-600 transition-all duration-200 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            "Processing..."
          ) : status === "Forget Password" ? (
            <>
              <FaKey className="text-xl" />
              Send OTP
            </>
          ) : (
            <>
              <FaUser className="text-xl" />
              Submit
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Login;
