import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import notificationIcon from "../src/assets/2645897.png";
import accountIcon from "../src/assets/accountIcon.png";
import { UserContext } from "../context/UserContext";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { NotificationContext } from "../context/NotificationProvider";

const Navbar = () => {
  const { isLogged, setIsLogged } = useContext(AppContext);
  const { user } = useContext(UserContext);
  const [isAvtrClicked, setIsAvtrClicked] = useState(false);
  const { SetEmail, email } = useContext(AppContext);
  const { newNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleVerification = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/user/verify-otp",
        { email: user.email },
        { withCredentials: true }
      );
      if (data.success) {
        if (data.msg === `OTP sent to ${user.email}`) {
          toast.success(`Verification OTP sent to ${user.email}`);
          navigate("/verify-otp");
        } else {
          toast.success(data.msg);
        }
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/user/logout",
        {},
        { withCredentials: true }
      );
      if (data.success) {
        setIsLogged(false);
        localStorage.clear();
        toast.success(data.msg);
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-row items-center py-2 md:py-3 border-b border-gray-200 justify-between px-4 md:px-8 bg-white shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <svg
          className="w-5 h-5 md:w-6 md:h-6 text-gradient-to-br from-blue-600 to-purple-600"
          viewBox="0 0 48 48"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
        </svg>
        <p className="text-lg md:text-xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          CampusConnect
        </p>
      </div>

      {/* Hamburger Menu for Mobile */}
      <button
        className="md:hidden text-gray-700 focus:outline-none hover:text-blue-600 transition-colors"
        onClick={toggleMenu}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Navigation Links */}
      <ul
        className={`${
          isMenuOpen ? "flex" : "hidden"
        } md:flex flex-col md:flex-row gap-4 md:gap-6 text-base md:text-lg font-medium text-gray-700 items-center absolute md:static top-14 left-0 right-0 bg-white md:bg-transparent p-4 md:p-0 z-50 shadow-md md:shadow-none border-b md:border-none border-gray-200`}
      >
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "hover:text-blue-500 transition-colors"
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/Events"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "hover:text-blue-500 transition-colors"
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Events
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/listEvent"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "hover:text-blue-500 transition-colors"
            }
            onClick={() => setIsMenuOpen(false)}
          >
            List Event
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/MyGroup"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "hover:text-blue-500 transition-colors"
            }
            onClick={() => setIsMenuOpen(false)}
          >
            My Groups
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/MyEvents"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "hover:text-blue-500 transition-colors"
            }
            onClick={() => setIsMenuOpen(false)}
          >
            My Events
          </NavLink>
        </li>

        {/* Notification */}
        <li>
          <NavLink
            className="relative bg-gray-100 h-10 w-10 rounded-full flex justify-center items-center hover:bg-blue-50 transition-colors"
            to="/notifications"
            onClick={() => setIsMenuOpen(false)}
          >
            <img
              className="w-5 h-5"
              src={notificationIcon}
              alt="notification"
            />
            {isLogged && newNotification !== 0 && (
              <span className="absolute bg-red-400 h-5 w-5 rounded-full flex justify-center items-center text-xs text-white font-semibold top-0 right-0">
                {newNotification}
              </span>
            )}
          </NavLink>
        </li>

        {/* Login / Avatar */}
        {!isLogged && (
          <li>
            <NavLink
              className="bg-gray-100 h-10 w-10 rounded-full flex justify-center items-center hover:bg-blue-50 transition-colors"
              to="/login"
              onClick={() => setIsMenuOpen(false)}
            >
              <img className="w-5 h-5" src={accountIcon} alt="account" />
            </NavLink>
          </li>
        )}

        {/* Show avatar if user is logged in and user has a name */}
        {isLogged && user?.userName && (
          <li className="relative">
            <div
              onClick={() => setIsAvtrClicked(!isAvtrClicked)}
              className="hover:cursor-pointer w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-lg flex justify-center items-center rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              {user.userName.charAt(0).toUpperCase()}
            </div>

            {isAvtrClicked && (
              <div className="bg-white/90 backdrop-blur-sm py-3 px-4 absolute top-12 md:top-14 right-0 rounded-xl shadow-lg border border-gray-100 z-50 animate-fadeIn">
                <ul className="flex flex-col gap-2 text-sm text-gray-700">
                  <li
                    onClick={() => {
                      handleVerification();
                      setIsAvtrClicked(false);
                      setIsMenuOpen(false);
                    }}
                    className="hover:bg-gradient-to-r from-blue-50 to-purple-50 rounded-md px-3 py-1.5 transition-colors duration-200"
                  >
                    Verify Account
                  </li>
                  <li>
                    <NavLink
                      onClick={() => {
                        handleLogout();
                        setIsAvtrClicked(false);
                        setIsMenuOpen(false);
                      }}
                      className="hover:bg-gradient-to-r from-blue-50 to-purple-50 rounded-md px-3 py-1.5 block transition-colors duration-200"
                    >
                      Log Out
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/report-event"
                      className="hover:bg-gradient-to-r from-blue-50 to-purple-50 rounded-md px-3 py-1.5 block transition-colors duration-200"
                      onClick={() => {
                        setIsAvtrClicked(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      Report Event
                    </NavLink>
                  </li>
                </ul>
              </div>
            )}
          </li>
        )}
      </ul>
    </div>
  );
};

// CSS for fade-in animation
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styles);
document.adoptedStyleSheets = [styleSheet];

export default Navbar;
