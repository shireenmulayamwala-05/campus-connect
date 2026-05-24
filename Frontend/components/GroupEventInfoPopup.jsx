import React from "react";
import { X } from "lucide-react";

const GroupEventInfoPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Blurred Background */}
      <div
        className="absolute inset-0 backdrop-blur-md bg-white/30"
        onClick={onClose}
      ></div>

      {/* Popup Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 z-50 overflow-hidden">
        {/* Gradient Header */}
        <div className="h-16 w-full bg-gradient-to-r from-blue-400 via-purple-500 to-violet-500 flex items-center justify-between px-6">
          <h2 className="text-white text-xl font-bold">
            Group Event Instructions
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Popup Content */}
        <div className="p-6 text-gray-700 space-y-3">
          <p>
            For group events, the first member will create the team and add all
            team members.
          </p>
          <p>
            Once the team is created, a{" "}
            <span className="font-semibold">Team Code</span> will be generated.
          </p>
          <p>
            During registration, the team leader only needs to enter the Team
            Code, and all team member details will be fetched automatically.
          </p>
          <p>
            Organizers can use this information to design the registration form
            fields accordingly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupEventInfoPopup;
