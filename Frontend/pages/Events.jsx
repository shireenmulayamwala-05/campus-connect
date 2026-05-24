import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { debounce } from "lodash";

const Events = () => {
  const [isDateClicked, setIsDateClicked] = useState(false);
  const [date, setDate] = useState("");
  const [isCategoryClicked, setIsCategoryClicked] = useState(false);
  const [category, setCategory] = useState("");
  const [isPaidClicked, setIsPaidClicked] = useState(false);
  const [paid, setPaid] = useState(undefined);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 50;

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  useEffect(() => {
    const getEvents = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `http://localhost:8000/api/v2/events/get-approved-events?page=${page}&limit=${limit}`,
          {
            params: { isVerified: true }, // Filter for approved events
            withCredentials: true,
          }
        );
        if (data.success === true) {
          setEvents(data.events || []);
          setFilteredEvents(data.events || []);
          setTotalPages(data.pagination?.totalPages || 1);
        } else {
          toast.error("Error while fetching events");
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    getEvents();
  }, [page]);

  useEffect(() => {
    const currentDate = new Date();
    const oneWeekFromNow = new Date(currentDate);
    oneWeekFromNow.setDate(currentDate.getDate() + 7);

    const result = events.filter((event) => {
      const eventStartDate = new Date(event.startDate);
      const matchesSearch = searchQuery
        ? event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return (
        matchesSearch &&
        (!category || event.category === category || category === "All") &&
        (!date ||
          new Date(event.startDate).toISOString().split("T")[0] === date) &&
        (paid === undefined || event.isFree === !paid)
      );
    });

    setFilteredEvents(result);
  }, [searchQuery, paid, date, category, events]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Search Bar and Filters */}
      <div className="flex flex-col md:flex-row justify-between mx-4 sm:mx-6 md:mx-8 lg:mx-12 items-center gap-4 md:gap-10 py-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
          All Events
        </h1>

        {/* Search Bar */}
        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder="Search events by title or description..."
            className="w-full md:w-64 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 md:gap-6 items-center">
          {/* Date Filter */}
          <div className="relative">
            <h5
              onClick={() => {
                setIsDateClicked(!isDateClicked);
                setIsPaidClicked(false);
                setIsCategoryClicked(false);
              }}
              className="cursor-pointer text-sm sm:text-base font-medium text-gray-700 hover:text-blue-500 transition-colors"
            >
              Date
            </h5>
            {isDateClicked && (
              <input
                className="absolute top-full mt-2 bg-white p-2 rounded-md shadow-lg border border-gray-200 cursor-pointer w-48 z-10"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <h5
              className="text-sm sm:text-base font-medium text-gray-700 cursor-pointer hover:text-blue-500 transition-colors"
              onClick={() => {
                setIsCategoryClicked(!isCategoryClicked);
                setIsPaidClicked(false);
                setIsDateClicked(false);
              }}
            >
              Category
            </h5>
            {isCategoryClicked && (
              <div className="absolute top-full mt-2 bg-white rounded-md shadow-lg border border-gray-200 w-40 flex flex-col py-2 z-10">
                {["Technical", "Cultural", "Sports", "Workshop", "All"].map(
                  (cat) => (
                    <div
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className="px-4 py-2 hover:bg-gradient-to-r hover:from-blue-100 hover:to-violet-100 hover:text-blue-600 cursor-pointer text-sm"
                    >
                      {cat}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Free/Paid Filter */}
          <div className="relative">
            <h5
              onClick={() => {
                setIsPaidClicked(!isPaidClicked);
                setIsCategoryClicked(false);
                setIsDateClicked(false);
              }}
              className="font-medium text-gray-700 text-sm sm:text-base cursor-pointer hover:text-blue-500 transition-colors"
            >
              Free/Paid
            </h5>
            {isPaidClicked && (
              <div className="absolute top-full mt-2 bg-white rounded-md shadow-lg border border-gray-200 w-24 flex flex-col py-2 z-10">
                <div
                  onClick={() => setPaid(true)}
                  className="px-4 py-2 hover:bg-gradient-to-r hover:from-blue-100 hover:to-violet-100 hover:text-blue-600 cursor-pointer text-sm"
                >
                  PAID
                </div>
                <div
                  onClick={() => setPaid(false)}
                  className="px-4 py-2 hover:bg-gradient-to-r hover:from-blue-100 hover:to-violet-100 hover:text-blue-600 cursor-pointer text-sm"
                >
                  FREE
                </div>
                <div
                  onClick={() => setPaid(undefined)}
                  className="px-4 py-2 hover:bg-gradient-to-r hover:from-blue-100 hover:to-violet-100 hover:text-blue-600 cursor-pointer text-sm"
                >
                  ANY
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mx-4 sm:mx-6 md:mx-8 lg:mx-12 mt-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-64 sm:h-80">
            <motion.div
              className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-gradient-to-r from-blue-500 to-violet-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((item) => {
            const isFillingFast = item.registeredCount / item.capacity >= 0.8;
            const isTrending =
              item.registeredCount / item.capacity >= 0.5 &&
              new Date(item.startDate) <=
                new Date(new Date().setDate(new Date().getDate() + 7));
            const isExpired = new Date(item.startDate) < new Date();

            return (
              <motion.div
                key={item._id || item.title}
                className={`rounded-xl flex flex-col gap-2 shadow-lg bg-white transition-shadow duration-300 ${
                  isExpired
                    ? "opacity-75 cursor-not-allowed"
                    : "hover:shadow-2xl"
                }`}
                whileHover={!isExpired ? { scale: 1.03 } : {}}
                transition={{ type: "spring", stiffness: 300 }}
                title={
                  isExpired
                    ? "This event has expired and cannot be viewed."
                    : ""
                }
              >
                {/* Image with optional expired tag */}
                <div className="relative">
                  <img
                    src={item.documents?.eventPoster}
                    alt={item.title}
                    className="rounded-t-xl h-48 sm:h-56 md:h-60 w-full object-cover"
                  />
                  {isExpired && (
                    <span className="absolute top-2 left-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Expired
                    </span>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 px-4 pt-2">
                  {isFillingFast && (
                    <span className="bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Filling Fast
                    </span>
                  )}
                  {isTrending && (
                    <span className="bg-gradient-to-r from-blue-400 to-violet-400 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Trending
                    </span>
                  )}
                  <span className="bg-gradient-to-r from-blue-300 to-violet-300 text-white text-xs font-medium px-2 py-1 rounded-full">
                    All
                  </span>
                </div>

                {/* Category + Date + Time */}
                <div className="flex flex-wrap justify-between items-center text-gray-500 font-medium text-xs sm:text-sm px-4 py-2">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                  <span>
                    {new Date(item.startDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>{item.startTime}</span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 px-4">
                  {item.title}
                </h3>

                {/* Description (2 lines only) */}
                <p className="text-gray-600 text-xs sm:text-sm px-4 line-clamp-2">
                  {item.description}
                </p>

                {/* Register Button */}
                {isExpired ? (
                  <div
                    className="my-3 mx-4 flex justify-center items-center rounded-full py-2 bg-gray-400 text-white font-medium text-sm cursor-not-allowed"
                    title="This event has expired and cannot be viewed."
                  >
                    View Event
                  </div>
                ) : (
                  <NavLink to={`/event/${item._id}`}>
                    <div className="my-3 mx-4 flex justify-center items-center hover:cursor-pointer rounded-full py-2 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium text-sm transition-colors duration-200">
                      View Event
                    </div>
                  </NavLink>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10 text-sm sm:text-base">
            No events available.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-3 my-8">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
          className={`px-4 py-2 rounded-md border text-sm ${
            page <= 1 || loading
              ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-500 border-gray-200"
              : "bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-none"
          }`}
        >
          Prev
        </button>
        <span className="text-sm text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || loading}
          className={`px-4 py-2 rounded-md border text-sm ${
            page >= totalPages || loading
              ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-500 border-gray-200"
              : "bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-none"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Events;
