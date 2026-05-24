import React, { Children, useContext } from "react";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import VerifyOtp from "../pages/VerifyOtp";
import Home from "../pages/Home";
import ListEvent from "../pages/ListEvent";
import Notifications from "../pages/Notifications";
import Events from "../pages/Events";
import MyGroups from "../pages/MyGroups";

import { AppContext } from "../context/AppContext";
import VeiwEvent from "../pages/VeiwEvent";
import MyEvents from "../pages/MyEvents";
// import RegisterEvent from "../pages/RegisterEvent";
import EventRegistrationForm from "../pages/EventRegistrationForm";
import Dashboard from "../pages/Dashboard";

const App = () => {
  const { isLogged } = useContext(AppContext);

  return (
    <div className="relative">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={!isLogged ? <Login /> : <Navigate to="/" replace />}
        />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route
          path="/listEvent"
          element={isLogged ? <ListEvent /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/notifications"
          element={
            isLogged ? <Notifications /> : <Navigate to="/login" replace />
          }
        />
        <Route path="/Events" element={<Events />} />
        <Route path="/MyEvents" element={<MyEvents />} />
        <Route
          path="/MyGroup"
          element={isLogged ? <MyGroups /> : <Navigate to="/login" replace />}
        />
        <Route path="/event/:eventId" element={<VeiwEvent />} />
        <Route
          path="/register/:eventId"
          element={isLogged ? <EventRegistrationForm /> : <Login />}
        />
        <Route path="/dashboard/:eventId" element={<Dashboard />} />
      </Routes>
    </div>
  );
};

export default App;
