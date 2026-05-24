import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const PendingEvents = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [isVisible, setIsVisible] = useState(false);

  const getPendingEvents = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8000/api/events/get-pendingEvents",
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.msg);
        setPendingEvents(Array.isArray(data.pendingEvents) ? data.pendingEvents : []);

        console.log(data.pendingEvents);
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
      setPendingEvents([]);
    } finally {
      setIsLoading(false);
      setIsVisible(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getPendingEvents();
    };
    fetchData();
  }, []);

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    setIsVisible(false); // Reset to retrigger animation
    setTimeout(() => {
      setPendingEvents((prevEvents) => {
        const sortedEvents = [...prevEvents].sort((a, b) => {
          if (value === "newest") {
            return new Date(b.date) - new Date(a.date);
          } else {
            return new Date(a.date) - new Date(b.date);
          }
        });
        console.log("Sorted events:", sortedEvents); // Debug sorted order
        return sortedEvents;
      });
      setIsVisible(true);
    }, 50); // Small delay to ensure reset takes effect
  };

  return (
    <div
      className="relative flex items-center flex-col min-h-screen "
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      {/* Loading Animation */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#f8f9fc]/90 z-50 transition-opacity duration-500">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-t-[#47579e] border-gray-200 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 bg-[#47579e]/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Heading div */}
      <div
        className={`flex justify-between w-[90%] sm:w-[60%] mt-[30px] mb-[30px] transition-opacity duration-400 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <h2 className="font-bold text-[2.2rem] text-[#0d0f1c]">
          Pending Events
        </h2>
        <select
          className="p-[10px] bg-gray-200 rounded focus:border-2 focus:border-[#47579e] outline-none text-[16px] shadow-sm hover:bg-gray-300 transition-all duration-300"
          onChange={handleSortChange}
          value={sortBy}
        >
          <option className="font-[400]" value="newest">
            Sort by: Newest first
          </option>
          <option className="font-[400]" value="oldest">
            Sort by: Oldest first
          </option>
        </select>
      </div>

      {/* Events div */}
      <div className="w-[90%] sm:w-[60%] flex flex-col gap-5">
        {!isLoading && Array.isArray(pendingEvents) && pendingEvents.length === 0 ? (
          <div className="p-4 text-center text-[#0d0f1c] text-lg font-medium">
            No pending events available
          </div>
        ) : (
          (Array.isArray(pendingEvents) ? pendingEvents : []).map((event, index) => (
            <div
              key={event._id || index}
              className={`border border-gray-100 rounded-[10px] p-[20px] shadow-md flex justify-between transition-all duration-300 ease-out transform hover:scale-[1.02] hover:rounded-[14px] hover:shadow-lg ${
                isVisible ? "animate-hyperos-slide" : "opacity-0 translate-y-10"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Details container on left */}
              <div className="flex flex-col gap-2">
                <p className="text-[#47579e] font-[500] text-sm tracking-tight">
                  Submitted by:{" "}
                  <span className="font-medium">
                    {event.organizerName || "Unknown"}
                  </span>
                </p>
                <p className="text-[#0d0f1c] font-[600] text-[1.2rem] tracking-tight">
                  {event.title || "Untitled Event"}
                </p>
                <p className="text-[#47579e] font-[500] text-sm tracking-tight">
                  Submitted On:{" "}
                  <span className="font-medium">
                    {event.date ? event.date.slice(0, 10) : "N/A"}
                  </span>
                </p>
                <NavLink
                  to={`/event/${event._id || "unknown"}`}
                  className="flex justify-center items-center text-[1rem] rounded-[16px] w-[120px] p-[5px] font-[500] bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d3dce6] hover:shadow-md transition-all duration-300 transform hover:scale-105"
                >
                  View Details
                </NavLink>
              </div>
              {/* Event poster box on right */}
              <div className="rounded-[10px]">
                <img
                  className="w-[320px] h-[200px] rounded-[10px] object-cover hover:shadow-sm transition-all duration-300"
                  src={
                    event?.documents?.eventPoster ||
                    "https://via.placeholder.com/320x200"
                  }
                  alt="Event Poster"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom CSS for HyperOS-inspired animation */}
      <style jsx>{`
        @keyframes hyperos-slide {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95) rotate(1deg);
          }
          60% {
            opacity: 0.8;
            transform: translateY(-5px) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-hyperos-slide {
          animation: hyperos-slide 0.6s cubic-bezier(0.36, 1.4, 0.64, 1)
            forwards;
        }
      `}</style>
    </div>
  );
};

export default PendingEvents;
