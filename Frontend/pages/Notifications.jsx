import React, { useContext, useEffect, useState } from "react";
import { NotificationContext } from "../context/NotificationProvider";
import { toast } from "react-toastify";
import axios from "axios";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaUsers,
  FaTimesCircle,
  FaExclamationTriangle,
  FaBell,
} from "react-icons/fa";

const Notifications = () => {
  const { notifications, setNewNotification, newNotification } = useContext(
    NotificationContext
  ) || {
    notifications: [],
    setNewNotification: () => {},
    newNotification: 0,
  };

  const [localNotifications, setLocalNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch notifications function
  const fetchNotifications = async (pageNo = 1) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get(
        `http://localhost:8000/api/notification/get-notifications?page=${pageNo}`,
        {
          withCredentials: true,
        }
      );

      if (data.success && Array.isArray(data.notifications)) {
        setLocalNotifications(data.notifications);
        setPagination(data.pagination);
        setPage(data.pagination.page);
      } else {
        setError("Failed to fetch notifications");
        toast.error("Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err.message);
      setError("Error fetching notifications");
      toast.error("Error fetching notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const handleMarkAsRead = async (notification) => {
    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/notification/markAsRead",
        { notificationID: notification._id },
        { withCredentials: true }
      );
      if (data.success) {
        if (newNotification > 0) {
          setNewNotification(newNotification - 1);
        }
        toast.success(data.msg);
        fetchNotifications(page);
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  // Updated theme styles (blue-violet gradient)
  const getNotificationStyles = (type) => {
    return {
      bgColor: "bg-gradient-to-r from-blue-500 to-violet-600",
      textColor: "text-white",
      icon: (() => {
        switch (type) {
          case "EVENT_LIVE":
          case "EVENT_UPDATE":
            return <FaCalendarAlt size={24} />;
          case "REGISTRATION_SUCCESS":
          case "APPROVAL":
            return <FaCheckCircle size={24} />;
          case "GROUP_ADDED":
            return <FaUsers size={24} />;
          case "EVENT_CANCELED":
          case "REJECTION":
            return <FaTimesCircle size={24} />;
          case "WARNING":
            return <FaExclamationTriangle size={24} />;
          default:
            return <FaBell size={24} />;
        }
      })(),
      buttonBg: "bg-gradient-to-r from-blue-500 to-violet-600",
      buttonHover: "hover:opacity-90",
      buttonTextColor: "text-white",
    };
  };

  const notificationVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: (index) => ({
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: index * 0.1,
      },
    }),
  };

  if (loading) {
    return (
      <main className="flex-1 py-10 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-8 text-gray-600">Loading notifications...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 py-10 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-8 text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  if (!Array.isArray(localNotifications) || localNotifications.length === 0) {
    return (
      <main className="flex-1 py-10 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-8 text-gray-600">No notifications available.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 py-10 bg-white">
      <div className="mx-auto max-w-5xl px-4">
        <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
        <div className="mt-8 space-y-6">
          {localNotifications.map((notification, index) => {
            if (!notification || !notification._id) return null;
            const styles = getNotificationStyles(notification.type);
            return (
              <motion.div
                key={notification._id}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={notificationVariants}
                className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${styles.bgColor} ${styles.textColor}`}
                >
                  {styles.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">
                      {notification.type}
                    </p>
                    <p className="text-sm text-gray-400">
                      {notification.createdAt
                        ? format(new Date(notification.createdAt), "yyyy-MM-dd")
                        : "Just now"}
                    </p>
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-gray-900">
                    {notification.title}
                  </h3>
                  <p className="mt-1 text-base text-gray-600">
                    {notification.message}
                  </p>
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification)}
                      className={`mt-4 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${styles.buttonBg} ${styles.buttonTextColor} ${styles.buttonHover}`}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="mt-8 flex justify-between items-center">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage(page - 1)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              pagination.hasPrevPage
                ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:opacity-90"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            Previous
          </button>

          <p className="text-gray-600">
            Page {page} of {pagination.totalPages}
          </p>

          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage(page + 1)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              pagination.hasNextPage
                ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:opacity-90"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
};

export default Notifications;
