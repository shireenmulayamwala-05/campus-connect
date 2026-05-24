import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import axios from "axios";
import { AdminContext } from "../Context/AdminProvider";

const Navbar = () => {
  const navigate = useNavigate();
  const { setIsAdminLogged } = useContext(AdminContext);
  const handleLogout = async () => {
    try {
      console.log("I was called");
      const { data } = await axios.post(
        "http://localhost:8000/api/admin/logout",
        {},
        { withCredentials: true }
      );
      console.log(data);
      if (data.success) {
        toast.success(data.msg);
        setIsAdminLogged(false);
        localStorage.removeItem("event");
        localStorage.removeItem("isAdminLogged");
        navigate("/login");
      } else {
        toast.error(msg.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-row items-center py-[10px] border-b border-gray-200  justify-between px-[30px]">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <svg
          className="w-[18px] h-[18px]"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
        </svg>
        <p className="text-[1.2rem] font-[500]">CampusConnext</p>
      </div>

      {/* Navigation Links */}
      <ul className="flex gap-6 text-[16px] font-[500] text-gray-700 items-center">
        <NavLink to="/pendingEvents">Pending Events</NavLink>
        <NavLink to="/approved-events">Approved Events</NavLink>
        <NavLink to="/all-users">All Users</NavLink>
        <NavLink to="/notifications">Notifications</NavLink>

        <div
          onClick={handleLogout}
          className=" text-[16px] font-[200] cursor-pointer relative flex justify-center items-center text-white font-bold h-[30px] w-[100px]  bg-blue-500 rounded-[16px] flex justify-center items-center"
        >
          Log Out
        </div>
      </ul>
    </div>
  );
};

export default Navbar;
