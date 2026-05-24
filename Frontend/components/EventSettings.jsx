"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Save, Loader2 } from "lucide-react";

// Toggle switch component
function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        className={`w-14 h-7 rounded-full transition-all duration-300 ${
          checked
            ? "bg-gradient-to-r from-blue-500 to-violet-600"
            : "bg-gray-300"
        }`}
      />
      <span
        className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
          checked ? "translate-x-7" : "translate-x-0"
        }`}
      />
      <span className="ml-4 text-sm font-semibold">{label}</span>
    </label>
  );
}

export default function EventSettings({ eventId }) {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    location: { hardcoded: "", googleMapLink: "" },
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    registrationDeadline: "",
    registrationDeadLineTime: "",
    capacity: "",
    allowRegistration: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const toISODate = (val) => {
    if (!val) return "";
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val))
      return val.slice(0, 10);
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    } catch {}
    return "";
  };

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/user/dashboard/get-partial-details?eventId=${eventId}`,
          { withCredentials: true }
        );

        if (res.data?.success && res.data.event) {
          const e = res.data.event;
          setEventData({
            title: e.title || "",
            description: e.description || "",
            location: {
              hardcoded: e.location?.hardcoded || "",
              googleMapLink: e.location?.googleMapLink || "",
            },
            startDate: toISODate(e.startDate),
            endDate: toISODate(e.endDate),
            startTime: e.startTime || "",
            endTime: e.endTime || "",
            registrationDeadline: toISODate(e.registrationDeadline),
            registrationDeadLineTime: e.registrationDeadLineTime || "",
            capacity: e.capacity ?? "",
            allowRegistration: e.allowRegistration ?? true,
          });
        } else {
          setError(res.data?.msg || "Failed to fetch event details");
        }
      } catch (err) {
        setError(err.response?.data?.msg || err.message || "Network error");
        console.error("fetchEvent error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "hardcoded" || name === "googleMapLink") {
      setEventData((prev) => ({
        ...prev,
        location: { ...prev.location, [name]: value },
      }));
      return;
    }
    if (type === "checkbox") {
      setEventData((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    if (name === "capacity") {
      setEventData((prev) => ({
        ...prev,
        capacity: value === "" ? "" : Number(value),
      }));
      return;
    }
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!eventData.title.trim()) newErrors.title = "This field is required";
    if (!eventData.description.trim())
      newErrors.description = "This field is required";
    if (!eventData.location.hardcoded.trim())
      newErrors.hardcoded = "This field is required";
    if (!eventData.location.googleMapLink.trim())
      newErrors.googleMapLink = "This field is required";
    if (!eventData.startDate) newErrors.startDate = "This field is required";
    if (!eventData.endDate) newErrors.endDate = "This field is required";
    if (!eventData.startTime) newErrors.startTime = "This field is required";
    if (!eventData.endTime) newErrors.endTime = "This field is required";
    if (!eventData.registrationDeadline)
      newErrors.registrationDeadline = "This field is required";
    if (!eventData.registrationDeadLineTime)
      newErrors.registrationDeadLineTime = "This field is required";
    // Capacity is optional, so no validation
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    if (!validateForm()) {
      setSaving(false);
      return;
    }
    try {
      const payload = {
        eventId,
        title: eventData.title,
        description: eventData.description,
        location: {
          hardcoded: eventData.location.hardcoded,
          googleMapLink: eventData.location.googleMapLink,
        },
        startDate: eventData.startDate || undefined,
        endDate: eventData.endDate || undefined,
        startTime: eventData.startTime || undefined,
        endTime: eventData.endTime || undefined,
        registrationDeadline: eventData.registrationDeadline || undefined,
        registrationDeadLineTime:
          eventData.registrationDeadLineTime || undefined,
        capacity: eventData.capacity === "" ? undefined : eventData.capacity,
        allowRegistration: eventData.allowRegistration,
      };

      const cleanPayload = JSON.parse(JSON.stringify(payload));

      const res = await axios.post(
        "http://localhost:8000/api/v1/user/dashboard/event-settings",
        cleanPayload,
        { withCredentials: true }
      );

      if (res.data?.success) {
        setMessage(res.data.msg || "Event updated successfully");
      } else {
        setError(res.data?.msg || "Failed to update event");
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Network error");
      console.error("save error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!eventId) {
    return (
      <div className="p-6 text-center text-red-600">No eventId provided.</div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-25 via-blue-50 to-violet-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-md border border-white/30 text-center text-gray-600">
            Loading event data...
          </div>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all duration-300";

  const labelClass = "text-sm font-medium text-gray-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-25 via-blue-50 to-violet-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-md border border-white/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-violet-600 rounded-2xl shadow-md">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Event Settings
              </h2>
              <p className="text-sm text-gray-500">
                Configure your event details
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-md border border-white/30 hover:shadow-lg transition-all duration-500">
          {message && (
            <div className="mb-3 p-3 bg-green-100 text-green-800 rounded-2xl shadow-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-3 p-3 bg-red-100 text-red-800 rounded-2xl shadow-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className={labelClass}>
                Event Title
              </label>
              <input
                id="title"
                name="title"
                placeholder="Enter event title"
                value={eventData.title}
                onChange={handleChange}
                className={inputClass}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className={labelClass}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter event description"
                value={eventData.description}
                onChange={handleChange}
                rows={3}
                className={inputClass}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="hardcoded" className={labelClass}>
                  Address
                </label>
                <input
                  id="hardcoded"
                  name="hardcoded"
                  placeholder="Enter address"
                  value={eventData.location.hardcoded}
                  onChange={handleChange}
                  className={inputClass}
                />
                {errors.hardcoded && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.hardcoded}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="googleMapLink" className={labelClass}>
                  Google Map Link
                </label>
                <input
                  id="googleMapLink"
                  name="googleMapLink"
                  placeholder="Enter Google Map link"
                  value={eventData.location.googleMapLink}
                  onChange={handleChange}
                  className={inputClass}
                />
                {errors.googleMapLink && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.googleMapLink}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="startDate" className={labelClass}>
                  Start Date
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={eventData.startDate}
                  onChange={handleChange}
                  className={inputClass}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="endDate" className={labelClass}>
                  End Date
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={eventData.endDate}
                  onChange={handleChange}
                  className={inputClass}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="startTime" className={labelClass}>
                  Start Time
                </label>
                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={eventData.startTime}
                  onChange={handleChange}
                  className={inputClass}
                />
                {errors.startTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.startTime}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="endTime" className={labelClass}>
                  End Time
                </label>
                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={eventData.endTime}
                  onChange={handleChange}
                  className={inputClass}
                />
                {errors.endTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="registrationDeadline" className={labelClass}>
                  Registration Deadline
                </label>
                <input
                  id="registrationDeadline"
                  name="registrationDeadline"
                  type="date"
                  value={eventData.registrationDeadline}
                  onChange={handleChange}
                  className={inputClass}
                />
                {errors.registrationDeadline && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.registrationDeadline}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="registrationDeadLineTime"
                  className={labelClass}
                >
                  Registration Deadline Time
                </label>
                <input
                  id="registrationDeadLineTime"
                  name="registrationDeadLineTime"
                  type="time"
                  value={eventData.registrationDeadLineTime}
                  onChange={handleChange}
                  className={inputClass}
                />
                {errors.registrationDeadLineTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.registrationDeadLineTime}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="capacity" className={labelClass}>
                Capacity
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                placeholder="Enter capacity"
                value={eventData.capacity}
                onChange={handleChange}
                className={inputClass}
              />
              {errors.capacity && (
                <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ToggleSwitch
                checked={eventData.allowRegistration}
                onChange={(val) =>
                  setEventData((prev) => ({ ...prev, allowRegistration: val }))
                }
                label="Allow Registration"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded-xl text-white font-semibold flex items-center gap-2 ${
                  saving
                    ? "bg-gray-400"
                    : "bg-gradient-to-r from-blue-500 to-violet-600 hover:shadow-lg"
                }`}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
