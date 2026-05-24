import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const ViewEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const getEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(
          `http://localhost:8000/api/v2/events/approved-events/${eventId}`,
          { withCredentials: true }
        );
        if (data.success) {
          setEvent(data.event);
        } else {
          setError(data.msg || "Failed to fetch event");
          toast.error(data.msg || "Failed to fetch event");
        }
      } catch (err) {
        const message =
          err.response?.data?.msg || err.message || "Something went wrong";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) {
      getEvent();
    }
  }, [eventId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString, timeString) => {
    return `${formatDate(dateString)} at ${timeString || "TBD"}`;
  };

  const handleRegister = () => {
    navigate(`/register/${eventId}`);
  };

  const handleWishlist = () => {
    toast.success("Added to wishlist!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <motion.div
            className="w-14 h-14 border-4 border-gradient-to-r from-blue-500 to-violet-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-700 text-lg font-medium">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <h2 className="text-red-800 text-2xl font-bold mb-3">
            Error Loading Event
          </h2>
          <p className="text-red-600 mb-6">{error || "Event not found"}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-violet-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-violet-600 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  const isFillingFast = event.registeredCount / event.capacity >= 0.8;
  const isTrending =
    event.registeredCount / event.capacity >= 0.5 &&
    new Date(event.startDate) <=
      new Date(new Date().setDate(new Date().getDate() + 7));

  return (
    <motion.div
      className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 bg-white min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Event Poster */}
      <div className="relative mb-10 rounded-xl overflow-hidden shadow-lg">
        <img
          src={event.documents?.eventPoster || "/placeholder.svg"}
          alt={event.title}
          className="w-full h-64 sm:h-80 md:h-96 object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <div className="flex flex-wrap gap-2 mb-3">
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
              {event.category}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-white rounded-xl shadow-lg p-8 sm:p-10 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Event Details
          </h2>
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-medium text-white ${
              event.isVerified ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {event.isVerified ? "Verified" : "Not Verified"}
          </span>
        </div>

        <p className="text-gray-600 mb-8 leading-relaxed text-base sm:text-lg">
          {event.description}
        </p>

        <div className="grid sm:grid-cols-2 gap-8 sm:gap-10 mb-8">
          <div className="flex items-start gap-4">
            <span className="text-blue-600 text-2xl">📅</span>
            <div>
              <p className="font-semibold text-gray-900 text-lg">Start Date</p>
              <p className="text-gray-600">
                {formatDateTime(event.startDate, event.startTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-blue-600 text-2xl">📅</span>
            <div>
              <p className="font-semibold text-gray-900 text-lg">End Date</p>
              <p className="text-gray-600">
                {formatDateTime(event.endDate, event.endTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-blue-600 text-2xl">📍</span>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                Location ({event.venueType})
              </p>
              <p className="text-gray-600">
                {event.location?.hardcoded}
                {event.location?.googleMapLink && (
                  <>
                    {" "}
                    (
                    <a
                      href={event.location.googleMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                      View on Google Maps
                    </a>
                    )
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-blue-600 text-2xl">👥</span>
            <div>
              <p className="font-semibold text-gray-900 text-lg">Capacity</p>
              <p className="text-gray-600">
                {event.registeredCount} / {event.capacity} registered
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-blue-600 text-2xl">💰</span>
            <div>
              <p className="font-semibold text-gray-900 text-lg">Price</p>
              <p className="text-gray-600">
                {event.isFree ? "Free" : `₹${event.price}`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-blue-600 text-2xl">👥</span>
            <div>
              <p className="font-semibold text-gray-900 text-lg">Team Size</p>
              <p className="text-gray-600">{event.teamSize}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-blue-600 text-2xl">📝</span>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                Cancellation Policy
              </p>
              <p className="text-gray-600">{event.cancellationPolicy}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-blue-600 text-2xl">💸</span>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                Refunds Allowed
              </p>
              <p className="text-gray-600">
                {event.allowRefunds ? "Yes" : "No"}
              </p>
            </div>
          </div>

          {event.registrationDeadline && (
            <div className="flex items-start gap-4">
              <span className="text-blue-600 text-2xl">⏰</span>
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  Registration Deadline
                </p>
                <p className="text-gray-600">
                  {formatDateTime(
                    event.registrationDeadline,
                    event.registrationDeadLineTime
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-4">
            <span className="text-blue-600 text-2xl">📅</span>
            <div>
              <p className="font-semibold text-gray-900 text-lg">Created</p>
              <p className="text-gray-600">
                {new Date(event.createdAt).toLocaleString("en-US")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-blue-600 text-2xl">📅</span>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                Last Updated
              </p>
              <p className="text-gray-600">
                {new Date(event.updatedAt).toLocaleString("en-US")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              event.isFree
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {event.isFree ? "Free Event" : "Paid Event"}
          </span>
          <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 capitalize">
            {event.venueType} Event
          </span>
        </div>
      </div>

      {/* Organizer Details */}
      {(event.organizerName ||
        event.organizerEmail ||
        event.organizerMobNo) && (
        <div className="bg-white rounded-xl shadow-lg p-8 sm:p-10 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Event Organizer
          </h2>
          {event.organizerName && (
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {event.organizerName}
            </h3>
          )}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {event.organizerEmail && (
              <a
                href={`mailto:${event.organizerEmail}`}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-3 transition-colors duration-200"
              >
                <span className="text-xl">✉️</span> {event.organizerEmail}
              </a>
            )}
            {event.organizerMobNo && (
              <a
                href={`tel:${event.organizerMobNo}`}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-3 transition-colors duration-200"
              >
                <span className="text-xl">📞</span> {event.organizerMobNo}
              </a>
            )}
          </div>
        </div>
      )}

      {/* FAQs */}
      {Array.isArray(event.faq) &&
        event.faq.filter((f) => f?.question || f?.answer).length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-10 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {event.faq
                .filter((f) => f?.question || f?.answer)
                .map((item, index) => (
                  <div
                    key={`faq-${index}`}
                    className="border-b border-gray-200 pb-3"
                  >
                    <button
                      onClick={() =>
                        setOpenFaq(openFaq === index ? null : index)
                      }
                      className="w-full text-left font-semibold text-gray-900 text-lg flex justify-between items-center hover:text-blue-600 transition-colors duration-200"
                    >
                      {item.question}
                      <motion.span
                        className="transform"
                        animate={{ rotate: openFaq === index ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        ⌄
                      </motion.span>
                    </button>
                    {openFaq === index && (
                      <motion.div
                        className="mt-2 text-gray-600 text-base sm:text-lg"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.answer}
                      </motion.div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-white pt-4">
        <motion.button
          onClick={handleRegister}
          className="flex-1 bg-gradient-to-r from-blue-500 to-violet-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-violet-600 transition-colors duration-200 shadow-md"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Register Now
        </motion.button>
        <motion.button
          onClick={handleWishlist}
          className="bg-gradient-to-r from-blue-400 to-violet-400 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:from-blue-500 hover:to-violet-500 transition-colors duration-200 flex items-center justify-center gap-2 shadow-md"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          ❤️ Add to Wishlist
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ViewEvent;
