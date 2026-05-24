"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Mail,
  Users,
  Search,
  Filter,
  Loader2,
  Eye,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// Filter pill component
function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 group overflow-hidden ${
        active
          ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-md hover:shadow-lg"
          : "bg-white/70 border border-gray-300/30 text-gray-700 hover:bg-gray-50/50 hover:shadow-sm hover:border-blue-400/30"
      }`}
    >
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-500 opacity-20 animate-pulse"></div>
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );
}

export default function ParticipantsSection({ eventId }) {
  const [groups, setGroups] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expanded, setExpanded] = useState({});
  const [notifyFor, setNotifyFor] = useState(null);
  const [notifyAllOpen, setNotifyAllOpen] = useState(false);
  const [notifyPayload, setNotifyPayload] = useState({
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [viewResponsesFor, setViewResponsesFor] = useState(null);
  const [responses, setResponses] = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch groups page-wise
  useEffect(() => {
    const fetchGroups = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/user/dashboard/get-contestants",
          {
            params: { eventId, page, limit },
            withCredentials: true,
          }
        );

        if (res.data.success) {
          const groupMap = new Map();
          res.data.data.forEach((d) => {
            const code = d.group.groupCode;
            if (!groupMap.has(code)) {
              groupMap.set(code, {
                ...d.group,
                id: code,
                checkedIn: d.isCheckedIn || false,
                leader: {
                  name: d.group.leader?.name || d.group.leaderName || "",
                  email: d.group.leader?.email || d.group.leaderEmail || "",
                  phone: d.group.leader?.phone || d.group.leaderContact || "",
                },
                members: (d.group.members || []).map((m) => ({
                  name: m.userName || "",
                  email: m.email || "",
                  phone: m.mobileNo || "",
                  id: m._id || m.email,
                })),
              });
            }
          });
          setGroups(Array.from(groupMap.values()));
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
      setLoading(false);
    };
    fetchGroups();
  }, [eventId, page, limit]);

  // Filtered groups for search + status
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return groups.filter((g) => {
      const matchesQuery =
        (g.groupName?.toLowerCase() || "").includes(q) ||
        (g.leader?.name?.toLowerCase() || "").includes(q) ||
        (g.leader?.email?.toLowerCase() || "").includes(q) ||
        g.members?.some(
          (m) =>
            (m?.name?.toLowerCase() || "").includes(q) ||
            (m?.email?.toLowerCase() || "").includes(q)
        );

      const matchesStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "Checked-in"
          ? g.checkedIn
          : !g.checkedIn;

      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, groups]);

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleCheckIn = async (id) => {
    const group = groups.find((g) => g.id === id);
    if (!group) return;

    const endpoint = group.checkedIn ? "/UncheckIn" : "/checkIn";

    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/user/dashboard${endpoint}`,
        { groupCode: id },
        { withCredentials: true }
      );

      if (res.data.success) {
        setGroups((prev) =>
          prev.map((g) => (g.id === id ? { ...g, checkedIn: !g.checkedIn } : g))
        );
      }
    } catch (err) {
      console.error("Error toggling check-in:", err);
    }
  };

  const sendNotification = async () => {
    if (!notifyFor) return;
    setSending(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/dashboard/send-updates",
        {
          groupCode: notifyFor.id,
          subject: notifyPayload.subject,
          message: notifyPayload.message,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(`Notification sent to ${notifyFor.groupName}!`);
        setNotifyFor(null);
        setNotifyPayload({ subject: "", message: "" });
        window.location.reload();
      }
    } catch (err) {
      console.error("Error sending notification:", err);
      toast.error("Failed to send notification. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const sendAllNotification = async () => {
    setSending(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/dashboard/notify-all",
        {
          eventId,
          subject: notifyPayload.subject,
          message: notifyPayload.message,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Notification sent to all contestants!");
        setNotifyAllOpen(false);
        setNotifyPayload({ subject: "", message: "" });
        window.location.reload();
      }
    } catch (err) {
      console.error("Error sending all notifications:", err);
      toast.error("Failed to send notifications. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleViewResponses = async (group) => {
    setViewResponsesFor(group);
    setResponsesLoading(true);
    setResponses([]);
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/user/dashboard/get-responses",
        {
          params: { eventId, groupCode: group.id },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setResponses(res.data.responses);
      } else {
        toast.error(res.data.msg || "Failed to fetch responses");
      }
    } catch (err) {
      console.error("Error fetching responses:", err);
      toast.error(err.response?.data?.msg || "Failed to fetch responses");
    } finally {
      setResponsesLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-25 via-blue-50 to-violet-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-md border border-white/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-violet-600 rounded-2xl shadow-md">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Participants
              </h2>
              <p className="text-sm text-gray-500">
                Manage and monitor attendee groups
              </p>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-md border border-white/30 hover:shadow-lg transition-all duration-500">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by group, leader, or member..."
                className="w-full pl-10 pr-4 py-3 border-0 bg-white/60 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:bg-white shadow-inner outline-none transition-all duration-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-xl">
                <Filter className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex gap-2">
                <FilterPill
                  label="All"
                  active={statusFilter === "All"}
                  onClick={() => setStatusFilter("All")}
                />
                <FilterPill
                  label="Checked-in"
                  active={statusFilter === "Checked-in"}
                  onClick={() => setStatusFilter("Checked-in")}
                />
                <FilterPill
                  label="Not checked-in"
                  active={statusFilter === "Not checked-in"}
                  onClick={() => setStatusFilter("Not checked-in")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-md border border-white/30 overflow-hidden hover:shadow-lg transition-all duration-500">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 via-white to-violet-50">
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Leader
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((g, index) => {
                  const isOpen = expanded[g.id];
                  return (
                    <React.Fragment key={g.id}>
                      <tr className="hover:bg-white/50 transition-all duration-200">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleExpand(g.id)}
                              className="p-2 rounded-xl hover:bg-gray-200 transition-colors duration-200 group"
                            >
                              {isOpen ? (
                                <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                              )}
                            </button>
                            <span className="ml-3 text-sm font-medium text-gray-900">
                              {(page - 1) * limit + index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
                              <span className="text-white font-bold text-xs">
                                {g.groupName?.charAt(0) || "?"}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {g.groupName || "Unknown Group"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {g.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-semibold text-gray-900">
                            {g.leader?.name || "Unknown Leader"}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-48">
                            {g.leader?.email || ""}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {g.members?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-900">
                            {g.leader?.email || ""}
                          </div>
                          {g.leader?.phone && (
                            <div className="text-xs text-gray-500">
                              {g.leader?.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={g.checkedIn || false}
                            onChange={() => toggleCheckIn(g.id)}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 accent-blue-500 cursor-pointer transition-all duration-200"
                          />
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleViewResponses(g)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Responses
                            </button>
                            <button
                              onClick={() => setNotifyFor(g)}
                              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                            >
                              <Mail className="h-4 w-4" />
                              Notify
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-6 py-8">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="p-2 bg-blue-100 rounded-xl">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <h4 className="text-lg font-bold text-gray-900">
                                Group Members
                              </h4>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {g.members?.length > 0 ? (
                                g.members.map((m) => (
                                  <div
                                    key={m.id}
                                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-gray-200/30"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="h-10 w-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                                        <span className="text-white font-bold text-sm">
                                          {m.name?.charAt(0) ||
                                            m.email?.charAt(0) ||
                                            "?"}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-gray-900">
                                          {m.name || "Unknown Member"}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                          {m.email || ""}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {m.phone || "No phone available"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div>No members</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No participants found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center px-6 py-4">
            <button
              onClick={() => setNotifyAllOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Notify All
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl border border-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Notification Modal */}
        {notifyFor && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50 p-4">
            <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-md border border-white/30 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-violet-600 rounded-2xl">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Notify {notifyFor.groupName || "Group"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Send an update to all members
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <input
                  value={notifyPayload.subject}
                  onChange={(e) =>
                    setNotifyPayload({
                      ...notifyPayload,
                      subject: e.target.value,
                    })
                  }
                  placeholder="Subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <textarea
                  value={notifyPayload.message}
                  onChange={(e) =>
                    setNotifyPayload({
                      ...notifyPayload,
                      message: e.target.value,
                    })
                  }
                  placeholder="Message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setNotifyFor(null)}
                  disabled={sending}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={sendNotification}
                  disabled={
                    sending || !notifyPayload.subject || !notifyPayload.message
                  }
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notify All Modal */}
        {notifyAllOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50 p-4">
            <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-md border border-white/30 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-violet-600 rounded-2xl">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Notify All Participants
                  </h3>
                  <p className="text-sm text-gray-500">
                    Send an update to all participants
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <input
                  value={notifyPayload.subject}
                  onChange={(e) =>
                    setNotifyPayload({
                      ...notifyPayload,
                      subject: e.target.value,
                    })
                  }
                  placeholder="Subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <textarea
                  value={notifyPayload.message}
                  onChange={(e) =>
                    setNotifyPayload({
                      ...notifyPayload,
                      message: e.target.value,
                    })
                  }
                  placeholder="Message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setNotifyAllOpen(false)}
                  disabled={sending}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={sendAllNotification}
                  disabled={
                    sending || !notifyPayload.subject || !notifyPayload.message
                  }
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Responses Modal */}
        {viewResponsesFor && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50 p-4">
            <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-md border border-white/30 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Responses for {viewResponsesFor.groupName || "Group"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    View submitted responses
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 max-h-80 overflow-y-auto">
                {responsesLoading ? (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-500" />
                  </div>
                ) : responses.length > 0 ? (
                  responses.map((resp, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Question: {resp.question}
                      </p>
                      <p className="text-sm text-gray-900">
                        Answer: {resp.answer}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No responses found
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setViewResponsesFor(null);
                    setResponses([]);
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
