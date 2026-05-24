import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import { FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";

const HostedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(
          "http://localhost:8000/api/v2/events/get-organizedEvent",
          { withCredentials: true }
        );
        if (data.success) {
          setEvents(data.organizedEvents || []);
        } else {
          setError(data.msg || "Failed to fetch organized events");
          toast.error(data.msg || "Failed to fetch organized events");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.msg || "Error fetching organized events";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 sm:h-80">
        <motion.div
          className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-gradient-to-r from-blue-500 to-violet-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return <p className="text-base text-red-600 text-center">{error}</p>;
  }

  if (events.length === 0) {
    return (
      <p className="text-base text-gray-600 text-center">
        No organized events found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mx-4 sm:mx-6 md:mx-8 lg:mx-12">
      {events.map((event) => (
        <motion.div
          key={event._id}
          className="rounded-xl flex flex-col gap-2 shadow-lg bg-white hover:shadow-2xl transition-shadow duration-300"
          whileHover={{ scale: 1.03 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* Poster */}
          <img
            src={
              event.documents?.eventPoster || "https://via.placeholder.com/300"
            }
            alt={event.title || "Event Poster"}
            className="rounded-t-xl h-48 sm:h-56 md:h-60 w-full object-cover"
            onError={(e) => (e.target.src = "https://via.placeholder.com/300")}
          />

          {/* Badge */}
          <div className="flex flex-wrap gap-2 px-4 pt-2">
            <span className="bg-gradient-to-r from-blue-300 to-violet-300 text-white text-xs font-medium px-2 py-1 rounded-full">
              {event.category || "N/A"}
            </span>
          </div>

          {/* Category + Date + Time */}
          <div className="flex flex-wrap justify-between items-center text-gray-500 font-medium text-xs sm:text-sm px-4 py-2">
            <span className="bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
              <svg width="0" height="0">
                <defs>
                  <linearGradient
                    id="iconGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <FaCalendarAlt size={14} className="text-[url(#iconGradient)]" />
              {event.category || "N/A"}
            </span>
            <span>
              {event.startDate
                ? format(new Date(event.startDate), "MMM d, yyyy")
                : "No date"}
            </span>
            <span>{event.startTime || "No time"}</span>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 px-4">
            {event.title || "Untitled Event"}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-xs sm:text-sm px-4 line-clamp-2">
            {event.description || "No description"}
          </p>

          {/* View Event Button */}
          <NavLink to={`/dashboard/${event._id}`}>
            <div className="my-3 mx-4 flex justify-center items-center hover:cursor-pointer rounded-full py-2 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium text-sm transition-colors duration-200">
              View Dashboard
            </div>
          </NavLink>
        </motion.div>
      ))}
    </div>
  );
};

export default HostedEvents;
