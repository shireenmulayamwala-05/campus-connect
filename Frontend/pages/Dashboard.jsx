// pages/dashboard.js (or app/dashboard/page.js for App Router)
// Assuming this is the main dashboard that mounts both EventOverview and ParticipantsSection

"use client";

import { useParams } from "react-router-dom";
// import { useParams } from "next/navigation";
import EventOverview from "../components/EventOverview.jsx"; // Adjust path as needed
import ParticipantsSection from "../components/ParticipantsSection.jsx"; // Adjust path as needed
import EventSettings from "../components/EventSettings.jsx";

export default function DashboardPage() {
  const params = useParams();
  const eventId = params.eventId; // Assuming eventId is in params, e.g., /dashboard/[eventId]

  if (!eventId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-25 via-blue-50 to-violet-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">
          Event ID not found. Please select an event.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-25 via-blue-50 to-violet-50">
      {/* Event Overview Section */}
      <EventOverview eventId={eventId} />

      {/* Participants Section */}
      <ParticipantsSection eventId={eventId} />
      <EventSettings eventId={eventId} />
    </div>
  );
}
