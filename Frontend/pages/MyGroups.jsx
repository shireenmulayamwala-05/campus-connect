"use client";

import axios from "axios";
import React, { useEffect, useState, useContext, useCallback } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { UserContext } from "../context/UserContext";
import {
  Plus,
  Users,
  Settings,
  Trash2,
  LogOut,
  X,
  UserPlus,
  UserMinus,
  AlertTriangle,
} from "lucide-react";

const MyGroups = () => {
  const { user } = useContext(UserContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    groupName: "",
    groupDescription: "",
    teamSize: 5,
  });
  const [createMembers, setCreateMembers] = useState([]);
  const [createAddEmail, setCreateAddEmail] = useState("");
  const [groupModal, setGroupModal] = useState(null);
  const [activeTab, setActiveTab] = useState("members");
  const [addEmail, setAddEmail] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const showError = (error) => {
    toast.error(error.response?.data?.msg || error.message);
  };

  const showSuccess = (msg) => {
    toast.success(msg);
  };

  const showWarning = (msg) => {
    toast.warning(msg);
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        "http://localhost:8000/api/v1/group/my-groups",
        {
          withCredentials: true,
        }
      );
      if (data.success) {
        setGroups(Array.isArray(data.groups) ? data.groups : []);
      } else {
        showError(new Error(data.msg || "Failed to fetch groups"));
      }
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const updateGroupsLocally = (updatedGroup) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.groupCode === updatedGroup.groupCode ? updatedGroup : g
      )
    );
  };

  const removeGroupLocally = (groupCode) => {
    setGroups((prev) => prev.filter((g) => g.groupCode !== groupCode));
  };

  const handleCreate = async () => {
    if (!createData.groupName || !createData.teamSize) {
      showWarning("Provide group name and team size");
      return;
    }
    if (!user?._id) {
      showError(new Error("User not authenticated"));
      return;
    }
    setActionLoading((prev) => ({ ...prev, create: true }));
    try {
      const payload = {
        ...createData,
        members: [...createMembers.map((m) => m._id), user._id], // Include leader's ID
      };
      const { data } = await axios.post(
        "http://localhost:8000/api/v1/group/create-group",
        payload,
        { withCredentials: true }
      );
      if (data.success) {
        showSuccess(data.msg);
        if (data.group) {
          setGroups((prev) => [...prev, data.group]);
        } else {
          await fetchGroups();
        }
        setCreateModal(false);
        setCreateData({ groupName: "", groupDescription: "", teamSize: 5 });
        setCreateMembers([]);
        setCreateAddEmail("");
      } else {
        showError(new Error(data.msg));
      }
    } catch (error) {
      showError(error);
    } finally {
      setActionLoading((prev) => ({ ...prev, create: false }));
    }
  };

  const handleDelete = async (groupCode) => {
    setActionLoading((prev) => ({ ...prev, [`delete_${groupCode}`]: true }));
    try {
      const { data } = await axios.delete(
        `http://localhost:8000/api/v1/group/delete-group/${groupCode}`,
        { withCredentials: true }
      );
      if (data.success) {
        showSuccess(data.msg);
        removeGroupLocally(groupCode);
        setGroupModal(null);
      } else {
        showError(new Error(data.msg));
      }
    } catch (error) {
      showError(error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`delete_${groupCode}`]: false }));
    }
  };

  const handleAddMember = async (groupCode, email, isCreate = false) => {
    if (!email) {
      showWarning("Enter member email");
      return;
    }
    const key = isCreate ? "add_create" : `add_${groupCode}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const { data: lookup } = await axios.get(
        `http://localhost:8000/api/v1/group/get-member?email=${encodeURIComponent(
          email
        )}`,
        { withCredentials: true }
      );
      if (!lookup.success) {
        showError(new Error(lookup.msg || "Member lookup failed"));
        return;
      }
      const member = lookup.user;
      if (!member?._id) {
        showError(new Error("Invalid user"));
        return;
      }
      if (isCreate) {
        if (createMembers.some((m) => m._id === member._id)) {
          showWarning("Member already added");
          return;
        }
        setCreateMembers((prev) => [...prev, member]);
        setCreateAddEmail("");
        return;
      }
      const { data } = await axios.post(
        "http://localhost:8000/api/v1/group/add-member",
        { groupCode, memberId: member._id },
        { withCredentials: true }
      );
      if (data.success) {
        showSuccess(data.msg);
        setGroups((prev) =>
          prev.map((g) =>
            g.groupCode === groupCode
              ? { ...g, membersID: [...g.membersID, member] }
              : g
          )
        );
        if (groupModal?.groupCode === groupCode) {
          setGroupModal((prev) => ({
            ...prev,
            membersID: [...prev.membersID, member],
          }));
        }
        setAddEmail("");
      } else {
        showError(new Error(data.msg));
      }
    } catch (error) {
      showError(error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleRemoveMember = async (groupCode, memberId) => {
    setActionLoading((prev) => ({ ...prev, [`remove_${memberId}`]: true }));
    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/v1/group/remove-member",
        { groupCode, memberId },
        { withCredentials: true }
      );
      if (data.success) {
        showSuccess(data.msg);
        setGroups((prev) =>
          prev.map((g) =>
            g.groupCode === groupCode
              ? {
                  ...g,
                  membersID: g.membersID.filter((m) => m._id !== memberId),
                }
              : g
          )
        );
        if (groupModal?.groupCode === groupCode) {
          setGroupModal((prev) => ({
            ...prev,
            membersID: prev.membersID.filter((m) => m._id !== memberId),
          }));
        }
      } else {
        showError(new Error(data.msg));
      }
    } catch (error) {
      showError(error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`remove_${memberId}`]: false }));
    }
  };

  const handleLeave = async (groupCode) => {
    setActionLoading((prev) => ({ ...prev, [`leave_${groupCode}`]: true }));
    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/v1/group/leave",
        { groupCode },
        { withCredentials: true }
      );
      if (data.success) {
        showSuccess(data.msg);
        removeGroupLocally(groupCode);
      } else {
        showError(new Error(data.msg));
      }
    } catch (error) {
      showError(error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`leave_${groupCode}`]: false }));
    }
  };

  const removeCreateMember = (memberId) => {
    setCreateMembers((prev) => prev.filter((m) => m._id !== memberId));
  };

  const handleEsc = useCallback((e) => {
    if (e.key === "Escape") {
      setCreateModal(false);
      setGroupModal(null);
      setConfirm(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [handleEsc]);

  // Define an array of gradient colors for cards
  const cardColors = [
    "from-blue-100 to-blue-200 border-blue-300",
    "from-green-100 to-green-200 border-green-300",
    "from-purple-100 to-purple-200 border-purple-300",
    "from-pink-100 to-pink-200 border-pink-300",
    "from-teal-100 to-teal-200 border-teal-300",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-zinc-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between mb-10"
      >
        <h1 className="text-3xl font-semibold text-indigo-900 tracking-tight">
          My Groups
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
          aria-label="Create a new group"
        >
          <Plus className="h-5 w-5" />
          Create Group
        </motion.button>
      </motion.div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-[200px]"
        >
          <div className="text-center">
            <svg
              className="animate-spin h-10 w-10 text-indigo-500 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-zinc-600 text-lg font-medium">
              Loading groups...
            </p>
          </div>
        </motion.div>
      ) : groups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-sm border border-zinc-100 p-8 text-center transition-all duration-300 hover:shadow-md"
        >
          <p className="text-zinc-600 text-lg font-medium">
            You are not part of any groups yet.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((g, index) => (
            <motion.div
              key={g._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.1 * (index % 10),
              }}
            >
              <div
                className={`bg-gradient-to-br ${
                  cardColors[index % cardColors.length]
                } rounded-xl shadow-sm border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-105`}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-zinc-900 truncate max-w-[70%]">
                    {g.groupName}
                  </h2>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {g.groupCode}
                  </span>
                </div>
                <p className="text-zinc-600 text-sm line-clamp-2 mb-5">
                  {g.groupDescription || "No description provided."}
                </p>
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-5">
                  <Users className="h-4 w-4" />
                  <span>
                    Members: {g.membersID.length}/{g.teamSize}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActiveTab("members");
                      setGroupModal(g);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors duration-200 text-sm flex-1"
                    aria-label={`View members of ${g.groupName}`}
                  >
                    <Users className="h-4 w-4" />
                    Members
                  </motion.button>
                  <motion.button
                    disabled={actionLoading[`leave_${g.groupCode}`]}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setConfirm({
                        title: "Confirm Leave",
                        message: "Are you sure you want to leave this group?",
                        onConfirm: () => handleLeave(g.groupCode),
                      })
                    }
                    className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 text-sm flex-1 disabled:opacity-50"
                    aria-label={`Leave ${g.groupName}`}
                  >
                    <LogOut className="h-4 w-4" />
                    {actionLoading[`leave_${g.groupCode}`]
                      ? "Leaving..."
                      : "Leave"}
                  </motion.button>
                  {g.leaderId?._id === user?._id && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setActiveTab("settings");
                        setGroupModal(g);
                      }}
                      className="px-2 py-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200 transition-colors duration-200"
                      aria-label={`Settings for ${g.groupName}`}
                    >
                      <Settings className="h-5 w-5" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {createModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-indigo-900">
                Create Group
              </h2>
              <button
                onClick={() => setCreateModal(false)}
                className="text-zinc-500 hover:text-zinc-700 transition-colors"
                aria-label="Close create group modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-6">
              <input
                className="w-full border border-zinc-200 rounded-lg p-3 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all duration-200"
                placeholder="Group Name"
                value={createData.groupName}
                onChange={(e) =>
                  setCreateData({ ...createData, groupName: e.target.value })
                }
              />
              <textarea
                className="w-full border border-zinc-200 rounded-lg p-3 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all duration-200"
                placeholder="Description (optional)"
                value={createData.groupDescription}
                onChange={(e) =>
                  setCreateData({
                    ...createData,
                    groupDescription: e.target.value,
                  })
                }
                rows={4}
              />
              <input
                type="number"
                min={1}
                max={15}
                className="w-full border border-zinc-200 rounded-lg p-3 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all duration-200"
                placeholder="Team Size"
                value={createData.teamSize}
                onChange={(e) =>
                  setCreateData({
                    ...createData,
                    teamSize: Number(e.target.value || 1),
                  })
                }
              />
              <div className="flex items-center gap-4">
                <input
                  className="flex-1 border border-zinc-200 rounded-lg p-3 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all duration-200"
                  placeholder="Enter member email"
                  value={createAddEmail}
                  onChange={(e) => setCreateAddEmail(e.target.value)}
                />
                <motion.button
                  disabled={actionLoading.add_create}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddMember(null, createAddEmail, true)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200 text-sm disabled:opacity-50"
                  aria-label="Add member to new group"
                >
                  <UserPlus className="h-4 w-4" />
                  {actionLoading.add_create ? "Adding..." : "Add"}
                </motion.button>
              </div>
              <div className="space-y-3">
                {createMembers.map((m) => (
                  <motion.div
                    key={m._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between px-4 py-2 bg-zinc-50 rounded-lg border border-zinc-100 shadow-sm hover:bg-zinc-100 transition-all duration-200"
                  >
                    <span className="text-zinc-700 text-sm font-medium">
                      {m.userName || m.email}
                    </span>
                    <button
                      onClick={() => removeCreateMember(m._id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                      aria-label={`Remove ${
                        m.userName || m.email
                      } from new group`}
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 border border-zinc-200 rounded-lg text-zinc-700 font-medium hover:bg-zinc-50 transition-colors duration-200 text-sm"
                onClick={() => setCreateModal(false)}
                aria-label="Cancel group creation"
              >
                Cancel
              </motion.button>
              <motion.button
                disabled={actionLoading.create}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-indigo-700 transition-colors duration-200 text-sm disabled:opacity-50"
                onClick={handleCreate}
                aria-label="Create group"
              >
                <Plus className="h-4 w-4" />
                {actionLoading.create ? "Creating..." : "Create"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {groupModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setGroupModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-indigo-900">
                {groupModal.groupName}
              </h2>
              <button
                onClick={() => setGroupModal(null)}
                className="text-zinc-500 hover:text-zinc-700 transition-colors"
                aria-label={`Close ${groupModal.groupName} modal`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex border-b border-zinc-200 mb-6">
              <button
                onClick={() => setActiveTab("members")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "members"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-zinc-600 hover:text-indigo-600 transition-colors"
                }`}
              >
                Members
              </button>
              {groupModal.leaderId?._id === user?._id && (
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "settings"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-zinc-600 hover:text-indigo-600 transition-colors"
                  }`}
                >
                  Settings
                </button>
              )}
            </div>
            {activeTab === "members" ? (
              <div className="space-y-3">
                {groupModal.membersID.map((m) => (
                  <motion.div
                    key={m._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm hover:bg-indigo-100 transition-all duration-200"
                  >
                    <span className="text-zinc-700 text-sm font-medium">
                      {m.userName || m.email || m._id}
                    </span>
                    {m._id === groupModal.leaderId?._id && (
                      <span className="text-xs text-indigo-600 font-semibold">
                        (Leader)
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              groupModal.leaderId?._id === user?._id && (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <input
                      className="flex-1 border border-zinc-200 rounded-lg p-3 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all duration-200"
                      placeholder="Enter member email"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                    />
                    <motion.button
                      disabled={actionLoading[`add_${groupModal.groupCode}`]}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleAddMember(groupModal.groupCode, addEmail)
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200 text-sm disabled:opacity-50"
                      aria-label="Add member to group"
                    >
                      <UserPlus className="h-4 w-4" />
                      {actionLoading[`add_${groupModal.groupCode}`]
                        ? "Adding..."
                        : "Add"}
                    </motion.button>
                  </div>
                  <div className="space-y-3">
                    {groupModal.membersID
                      .filter((m) => m._id !== groupModal.leaderId?._id)
                      .map((m) => (
                        <motion.div
                          key={m._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between px-4 py-2 bg-zinc-50 rounded-lg border border-zinc-100 shadow-sm hover:bg-zinc-100 transition-all duration-200"
                        >
                          <span className="text-zinc-700 text-sm font-medium">
                            {m.userName || m.email}
                          </span>
                          <button
                            disabled={actionLoading[`remove_${m._id}`]}
                            onClick={() =>
                              handleRemoveMember(groupModal.groupCode, m._id)
                            }
                            className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                            aria-label={`Remove ${
                              m.userName || m.email
                            } from group`}
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        </motion.div>
                      ))}
                  </div>
                  <motion.button
                    disabled={actionLoading[`delete_${groupModal.groupCode}`]}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setConfirm({
                        title: "Confirm Delete",
                        message:
                          "Are you sure you want to delete this group? This action cannot be undone.",
                        onConfirm: () => handleDelete(groupModal.groupCode),
                      })
                    }
                    className="flex items-center gap-2 w-full px-3 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 text-sm disabled:opacity-50"
                    aria-label={`Delete ${groupModal.groupName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    {actionLoading[`delete_${groupModal.groupCode}`]
                      ? "Deleting..."
                      : "Delete Group"}
                  </motion.button>
                </div>
              )
            )}
            <div className="mt-8 text-right">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGroupModal(null)}
                className="px-4 py-2 border border-zinc-200 rounded-lg text-zinc-700 font-medium hover:bg-zinc-50 transition-colors duration-200 text-sm"
                aria-label="Close modal"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {confirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-6 w-full max-w-sm"
          >
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-semibold text-indigo-900">
                {confirm.title}
              </h2>
            </div>
            <p className="text-zinc-600 mb-6">{confirm.message}</p>
            <div className="flex justify-end gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setConfirm(null)}
                className="px-4 py-2 border border-zinc-200 rounded-lg text-zinc-700 font-medium hover:bg-zinc-50 transition-colors duration-200 text-sm"
                aria-label="Cancel action"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  confirm.onConfirm();
                  setConfirm(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 text-sm"
                aria-label="Confirm action"
              >
                <AlertTriangle className="h-4 w-4" />
                Confirm
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MyGroups;
