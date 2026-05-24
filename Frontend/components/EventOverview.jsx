"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const trendData = [
  { day: "Mon", registrations: 24, checkins: 18 },
  { day: "Tue", registrations: 30, checkins: 22 },
  { day: "Wed", registrations: 28, checkins: 20 },
  { day: "Thu", registrations: 35, checkins: 25 },
  { day: "Fri", registrations: 40, checkins: 34 },
  { day: "Sat", registrations: 22, checkins: 19 },
  { day: "Sun", registrations: 18, checkins: 14 },
];

export default function EventOverview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Overview
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Groups", value: "3" },
            { label: "Total Members", value: "13" },
            { label: "Check-in Rate", value: "33%" },
            { label: "Revenue (Paid)", value: "$42,560" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-md hover:shadow-lg transition rounded-2xl p-6"
            >
              <p className="text-base text-gray-600">{stat.label}</p>
              <p className="text-2xl font-semibold mt-2 text-gray-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Chart Card */}
        <div className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-md rounded-2xl p-6">
          <p className="text-base font-medium text-gray-700 mb-4">
            Registrations & Check-ins (7 days)
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: "#6b7280" }} />
                <YAxis tick={{ fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    color: "#111827",
                    borderRadius: "0.5rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="checkins"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
