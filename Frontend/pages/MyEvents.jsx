import React, { useState } from "react";
import { motion } from "framer-motion";
import HostedEvents from "../components/HostedEvents.jsx";
import ParticipatedEvents from "../components/ParticipatedEvents.jsx";
import WishlistedEvents from "../components/WishlistedEvents.jsx";

const MyEvents = () => {
  const [activeTab, setActiveTab] = useState("organized"); // Default to OrganizedEvents

  // Animation variants for the active tab indicator
  const indicatorVariants = {
    organized: { x: 0, width: "33.33%" },
    participated: { x: "100%", width: "33.33%" },
    wishlist: { x: "200%", width: "33.33%" },
  };

  // Button animation variants
  const buttonVariants = {
    inactive: { scale: 1, opacity: 0.7 },
    active: { scale: 1.05, opacity: 1 },
    hover: { scale: 1.1, transition: { type: "spring", stiffness: 400 } },
  };

  return (
    <main className="flex-1 py-2 bg-gray-50 min-h-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Mini Navbar */}
        <div className="mt-8 flex justify-center">
          <div className="relative flex w-full max-w-3xl rounded-full bg-white/30 backdrop-blur-md border border-gray-200 shadow-lg p-1">
            {/* Active Tab Indicator */}
            <motion.div
              className="absolute top-1 bottom-1 left-1 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
              variants={indicatorVariants}
              animate={activeTab}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
            {/* Buttons */}
            <motion.button
              variants={buttonVariants}
              initial="inactive"
              animate={activeTab === "organized" ? "active" : "inactive"}
              whileHover="hover"
              onClick={() => setActiveTab("organized")}
              className={`flex-1 text-sm font-semibold z-10 py-2 rounded-full ${
                activeTab === "organized" ? "text-white" : "text-gray-900"
              }`}
            >
              Organized Events
            </motion.button>
            <motion.button
              variants={buttonVariants}
              initial="inactive"
              animate={activeTab === "participated" ? "active" : "inactive"}
              whileHover="hover"
              onClick={() => setActiveTab("participated")}
              className={`flex-1 text-sm font-semibold z-10 py-2 rounded-full ${
                activeTab === "participated" ? "text-white" : "text-gray-900"
              }`}
            >
              Participated Events
            </motion.button>
            <motion.button
              variants={buttonVariants}
              initial="inactive"
              animate={activeTab === "wishlist" ? "active" : "inactive"}
              whileHover="hover"
              onClick={() => setActiveTab("wishlist")}
              className={`flex-1 text-sm font-semibold z-10 py-2 rounded-full ${
                activeTab === "wishlist" ? "text-white" : "text-gray-900"
              }`}
            >
              Wishlist
            </motion.button>
          </div>
        </div>
        {/* Content Area */}
        <div className="mt-8">
          {activeTab === "organized" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HostedEvents />
            </motion.div>
          )}
          {activeTab === "participated" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ParticipatedEvents />
            </motion.div>
          )}
          {activeTab === "wishlist" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WishlistedEvents />
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
};

export default MyEvents;
