import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import { AdminContext } from "./Context/AdminProvider";
import { DashBoard } from "./pages/DashBoard";
import PendingEvents from "./pages/PendingEvents";
import Event from "./pages/Event";
import ApprovedEvents from "./pages/ApprovedEvents";
import AdminNotifications from "./pages/AdminNotifications";
import AllUsers from "./pages/AllUsers";

// ProtectedRoute component to guard routes
const ProtectedRoute = ({ children }) => {
  const { isAdminLogged } = useContext(AdminContext);
  return isAdminLogged ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const { isAdminLogged } = useContext(AdminContext);

  return (
    <div>
      <ToastContainer autoClose={3000} position="top-right" />
      {isAdminLogged && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pendingEvents"
          element={
            <ProtectedRoute>
              <PendingEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approved-events"
          element={
            <ProtectedRoute>
              <ApprovedEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <AdminNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-users"
          element={
            <ProtectedRoute>
              <AllUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event/:eventId"
          element={
            <ProtectedRoute>
              <Event />
            </ProtectedRoute>
          }
        />
        {/* Optional: Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;
