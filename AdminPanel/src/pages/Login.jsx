import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { FiMail, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { AdminContext } from "../Context/AdminProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsAdminLogged } = useContext(AdminContext);
  const handleSubmit = async () => {
    if (!email || !password) {
      toast.warning("Please fill in both email and password");
      return;
    }
    setIsLoading(true);
    try {
      ///logic
      const { data } = await axios.post(
        "http://localhost:8000/api/admin/login",
        { email, password },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.msg);
        setIsAdminLogged(true);

        navigate("/dashboard");
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "An error occurred during login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-gradient-to-br from-[#f8f9fc] to-[#e6e9f4]"
      style={{
        fontFamily: 'Lexend, "Noto Sans", sans-serif',
      }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4768fa]"></div>
        </div>
      )}
      <div className="layout-container flex h-full grow flex-col  items-center justify-center py-10 w-full max-w-[1200px] mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border-t-5 border-b-5 border-blue-500">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-[#0d0f1c] text-3xl font-bold leading-tight tracking-tight text-center">
              Login
            </h1>
            {/* Email Field with Icon */}
            <div className="w-full">
              <label className="block text-[#0d0f1c] text-base font-medium leading-normal mb-2">
                Email *
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#47579e] text-lg" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  type="email"
                  className="w-full px-10 py-3 rounded-lg border border-[#ced3e9] bg-[#f8f9fc] focus:outline-none focus:ring-2 focus:ring-[#4768fa] focus:border-transparent text-[#0d0f1c] text-base font-normal placeholder:text-[#47579e]"
                />
              </div>
            </div>
            {/* Password Field with Icon */}
            <div className="w-full">
              <label className="block text-[#0d0f1c] text-base font-medium leading-normal mb-2">
                Password *
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#47579e] text-lg" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  type="password"
                  className="w-full px-10 py-3 rounded-lg border border-[#ced3e9] bg-[#f8f9fc] focus:outline-none focus:ring-2 focus:ring-[#4768fa] focus:border-transparent text-[#0d0f1c] text-base font-normal placeholder:text-[#47579e]"
                />
              </div>
            </div>
            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-full bg-[#4768fa] text-[#f8f9fc] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#3957d1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <span className="truncate">
                {isLoading ? "Logging in..." : "Login"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
