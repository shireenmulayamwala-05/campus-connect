import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ApprovedEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const fetchApprovedEvents = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        "http://localhost:8000/api/events/get-approved-events",
        { withCredentials: true }
      );
      if (data.success) {
        setEvents(Array.isArray(data.events) ? data.events : []);
      } else {
        toast.error(data.msg || "Failed to fetch approved events");
        setEvents([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message || "Error fetching approved events");
      setEvents([]);
    } finally {
      setIsLoading(false);
      setIsVisible(true);
    }
  };

  useEffect(() => {
    fetchApprovedEvents();
  }, []);

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    setIsVisible(false);
    setTimeout(() => {
      setEvents((prev) => {
        const arr = [...prev];
        arr.sort((a, b) => {
          const ad = new Date(a.date || a.dateOfEvent || 0).getTime();
          const bd = new Date(b.date || b.dateOfEvent || 0).getTime();
          return value === "newest" ? bd - ad : ad - bd;
        });
        return arr;
      });
      setIsVisible(true);
    }, 50);
  };

  return (
    <div className="relative flex items-center flex-col min-h-screen " style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#f8f9fc]/90 z-50 transition-opacity duration-500">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-t-[#47579e] border-gray-200 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 bg-[#47579e]/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`flex justify-between w-[90%] sm:w-[60%] mt-[30px] mb-[30px] transition-opacity duration-400 ${isVisible ? "opacity-100" : "opacity-0"}`}>
        <h2 className="font-bold text-[2.2rem] text-[#0d0f1c]">Approved Events</h2>
        <select className="p-[10px] bg-gray-200 rounded focus:border-2 focus:border-[#47579e] outline-none text-[16px] shadow-sm hover:bg-gray-300 transition-all duration-300" onChange={handleSortChange} value={sortBy}>
          <option className="font-[400]" value="newest">Sort by: Newest first</option>
          <option className="font-[400]" value="oldest">Sort by: Oldest first</option>
        </select>
      </div>

      {/* List */}
      <div className="w-[90%] sm:w-[60%] flex flex-col gap-5">
        {!isLoading && events.length === 0 ? (
          <div className="p-4 text-center text-[#0d0f1c] text-lg font-medium">No approved events available</div>
        ) : (
          events.map((event, index) => (
            <div key={event._id || index} className={`border border-gray-100 rounded-[10px] p-[20px] shadow-md flex justify-between transition-all duration-300 ease-out transform hover:scale-[1.02] hover:rounded-[14px] hover:shadow-lg ${isVisible ? "animate-hyperos-slide" : "opacity-0 translate-y-10"}`} style={{ animationDelay: `${index * 0.06}s` }}>
              {/* Details */}
              <div className="flex flex-col gap-2 pr-4">
                <p className="text-[#47579e] font-[500] text-sm tracking-tight">Organizer: <span className="font-medium">{event.organizerName || "Unknown"}</span></p>
                <p className="text-[#0d0f1c] font-[600] text-[1.2rem] tracking-tight">{event.title || "Untitled Event"}</p>
                <p className="text-[#47579e] font-[500] text-sm tracking-tight">Date: <span className="font-medium">{(event.dateOfEvent || event.date || "").toString().slice(0, 10)}</span></p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{event.category}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{event.mode}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{event.isEventPaid ? "Paid" : "Free"}</span>
                  {typeof event.intake === "number" && (
                    <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Capacity: {event.intake}</span>
                  )}
                </div>
                {/* Future admin actions */}
                <div className="flex gap-2 pt-3">
                  <button disabled className="cursor-not-allowed opacity-60 px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm">Delete (coming soon)</button>
                  <button disabled className="cursor-not-allowed opacity-60 px-3 py-1.5 rounded-lg bg-yellow-500 text-white text-sm">Hide (coming soon)</button>
                </div>
              </div>
              {/* Poster */}
              <div className="rounded-[10px]">
                <img className="w-[320px] h-[200px] rounded-[10px] object-cover hover:shadow-sm transition-all duration-300" src={event?.eventPoster || "https://via.placeholder.com/320x200"} alt="Event Poster" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes hyperos-slide {
          0% { opacity: 0; transform: translateY(20px) scale(0.95) rotate(1deg); }
          60% { opacity: 0.8; transform: translateY(-5px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-hyperos-slide { animation: hyperos-slide 0.5s cubic-bezier(0.36, 1.4, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
};

export default ApprovedEvents;
