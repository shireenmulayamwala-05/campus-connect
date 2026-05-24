import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  X,
  Info,
} from "lucide-react";
import GroupEventInfoPopup from "../components/GroupEventInfoPopup";

const FormBuilder = ({
  formFields,
  setFormFields,
  formTitle,
  setFormTitle,
  formDescription,
  setFormDescription,
}) => {
  const [preview, setPreview] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now() + Math.random(),
      typeOfQuestion: type,
      question: "Untitled Question",
      placeholder: "",
      option:
        type === "select" || type === "checkbox" ? ["Option 1"] : undefined,
    };
    setFormFields((prev) => [...prev, newQuestion]);
    setShowAddMenu(false);
  };

  const updateQuestion = (id, key, value) => {
    setFormFields((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [key]: value } : q))
    );
  };

  const addOption = (id) => {
    setFormFields((prev) =>
      prev.map((q) => {
        if (q.id === id && q.option) {
          return {
            ...q,
            option: [...q.option, `Option ${q.option.length + 1}`],
          };
        }
        return q;
      })
    );
  };

  const updateOption = (id, index, value) => {
    setFormFields((prev) =>
      prev.map((q) => {
        if (q.id === id && q.option) {
          const options = [...q.option];
          options[index] = value;
          return { ...q, option: options };
        }
        return q;
      })
    );
  };

  const deleteOption = (id, index) => {
    setFormFields((prev) =>
      prev.map((q) => {
        if (q.id === id && q.option) {
          const options = [...q.option];
          options.splice(index, 1);
          return { ...q, option: options.length > 0 ? options : undefined };
        }
        return q;
      })
    );
  };

  const duplicateQuestion = (id) => {
    const questionToDuplicate = formFields.find((q) => q.id === id);
    if (questionToDuplicate) {
      const duplicated = {
        ...questionToDuplicate,
        id: Date.now() + Math.random(),
        question: questionToDuplicate.question + " (Copy)",
      };
      setFormFields((prev) => [...prev, duplicated]);
    }
  };

  const deleteQuestion = (id) => {
    setFormFields((prev) => prev.filter((q) => q.id !== id));
  };

  const moveQuestion = (fromIndex, toIndex) => {
    const newFields = [...formFields];
    const [moved] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, moved);
    setFormFields(newFields);
  };

  const renderPreviewField = (q) => {
    const commonClass =
      "w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition";

    switch (q.typeOfQuestion) {
      case "text":
      case "email":
      case "phone":
      case "number":
        return (
          <input
            type={
              q.typeOfQuestion === "email"
                ? "email"
                : q.typeOfQuestion === "phone"
                ? "tel"
                : q.typeOfQuestion === "number"
                ? "number"
                : "text"
            }
            placeholder={q.placeholder || "Enter your answer"}
            className={commonClass}
            disabled
          />
        );
      case "select":
        return (
          <select className={commonClass} disabled>
            <option value="">Select an option</option>
            {q.option &&
              q.option.map((opt, idx) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {q.option &&
              q.option.map((opt, idx) => (
                <label key={idx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-600"
                    disabled
                  />
                  <span className="text-gray-800">{opt}</span>
                </label>
              ))}
          </div>
        );
      case "date":
        return <input type="date" className={commonClass} disabled />;
      case "file":
        return <input type="file" className={commonClass} disabled />;
      default:
        return (
          <input
            placeholder="Enter your answer"
            className={commonClass}
            disabled
          />
        );
    }
  };

  const getTypeDisplayName = (type) => {
    switch (type) {
      case "text":
        return "Short Answer";
      case "email":
        return "Email";
      case "phone":
        return "Phone Number";
      case "number":
        return "Number";
      case "select":
        return "Multiple Choice";
      case "checkbox":
        return "Checkboxes";
      case "date":
        return "Date";
      case "file":
        return "File Upload";
      default:
        return type;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      {/* Form Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <input
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="Untitled Form"
          className="w-full text-2xl font-semibold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-0 placeholder-gray-400"
        />
        <textarea
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
          placeholder="Add a description for your form (e.g., 'Register for our event!')"
          className="w-full mt-4 text-sm text-gray-600 bg-transparent border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-0 placeholder-gray-400 resize-none"
          rows={2}
        />
      </motion.div>

      {/* Preview Toggle */}
      <div className="flex justify-start mt-8 mb-6">
        <button
          onClick={() => setPreview(!preview)}
          className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
        >
          {preview ? "Edit Form" : "Preview Form"}
        </button>
      </div>

      {/* Questions Section */}
      <AnimatePresence>
        {preview ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {formFields.map((q) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {q.question}{" "}
                      {q.required && <span className="text-red-500">*</span>}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                    {getTypeDisplayName(q.typeOfQuestion)}
                  </span>
                </div>
                <div className="mt-4">{renderPreviewField(q)}</div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {formFields.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col space-y-1 mt-2 cursor-move text-gray-400 hover:text-gray-600">
                    <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-500">
                        Question {index + 1}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <select
                          value={q.typeOfQuestion}
                          onChange={(e) =>
                            updateQuestion(
                              q.id,
                              "typeOfQuestion",
                              e.target.value
                            )
                          }
                          className="px-3 py-1.5 border border-gray-300 bg-gray-50 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="text">Short Answer</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone Number</option>
                          <option value="number">Number</option>
                          <option value="select">Multiple Choice</option>
                          <option value="checkbox">Checkboxes</option>
                          <option value="date">Date</option>
                          <option value="file">File Upload</option>
                        </select>
                      </div>
                    </div>
                    <input
                      value={q.question}
                      onChange={(e) =>
                        updateQuestion(q.id, "question", e.target.value)
                      }
                      placeholder="Enter question"
                      className="w-full text-xl font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded-lg p-3 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {q.typeOfQuestion === "select" ||
                    q.typeOfQuestion === "checkbox" ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            Options
                          </label>
                          <button
                            type="button"
                            onClick={() => addOption(q.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Option
                          </button>
                        </div>
                        {q.option &&
                          q.option.map((opt, optIndex) => (
                            <div
                              key={optIndex}
                              className="flex items-center space-x-2"
                            >
                              <input
                                value={opt}
                                onChange={(e) =>
                                  updateOption(q.id, optIndex, e.target.value)
                                }
                                placeholder={`Option ${optIndex + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-300 bg-gray-50 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                              />
                              <button
                                type="button"
                                onClick={() => deleteOption(q.id, optIndex)}
                                className="p-1 text-gray-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <input
                        value={q.placeholder}
                        onChange={(e) =>
                          updateQuestion(q.id, "placeholder", e.target.value)
                        }
                        placeholder="Placeholder (optional)"
                        className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    )}
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      type="button"
                      onClick={() => duplicateQuestion(q.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Duplicate Question"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteQuestion(q.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200 mt-4">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => moveQuestion(index, index - 1)}
                      disabled={index === 0}
                      className="px-3 py-1 text-xs text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveQuestion(index, index + 1)}
                      disabled={index === formFields.length - 1}
                      className="px-3 py-1 text-xs text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) =>
                        updateQuestion(q.id, "required", e.target.checked)
                      }
                      className="rounded text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Required
                    </span>
                  </label>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Question Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center mt-10"
      >
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition"
          >
            <Plus className="w-6 h-6" />
          </button>
          <AnimatePresence>
            {showAddMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10 min-w-[200px]"
              >
                {[
                  "text",
                  "email",
                  "phone",
                  "number",
                  "select",
                  "checkbox",
                  "date",
                  "file",
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => addQuestion(type)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    {getTypeDisplayName(type)}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const ListEvent = () => {
  const [showGroupEventInfo, setShowGroupEventInfo] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [locationText, setLocationText] = useState("");
  const [googleMapLink, setGoogleMapLink] = useState("");
  const [category, setCategory] = useState("Technical");
  const [venueType, setVenueType] = useState("offline");
  const [faq1, setFaq1] = useState({ question: "", answer: "" });
  const [faq2, setFaq2] = useState({ question: "", answer: "" });
  const [faq3, setFaq3] = useState({ question: "", answer: "" });
  const [faq4, setFaq4] = useState({ question: "", answer: "" });
  const [faq5, setFaq5] = useState({ question: "", answer: "" });
  const [eventPoster, setEventPoster] = useState(null);
  const [identityProof, setIdentityProof] = useState(null);
  const [permissionLetter, setPermissionLetter] = useState(null);
  const [eventBrochure, setEventBrochure] = useState(null);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState(0);
  const [capacity, setCapacity] = useState(0);
  const [teamSize, setTeamSize] = useState(1);
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [registrationDeadlineTime, setRegistrationDeadlineTime] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState(
    "No refunds after registration"
  );
  const [allowRefunds, setAllowRefunds] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formTitle, setFormTitle] = useState("Registration Form");
  const [formDescription, setFormDescription] = useState("");
  const [formFields, setFormFields] = useState([
    {
      id: Date.now(),
      typeOfQuestion: "text",
      question: "Full Name",
      placeholder: "Enter your full name",
      required: true,
    },
    {
      id: Date.now() + 1,
      typeOfQuestion: "email",
      question: "Email Address",
      placeholder: "Enter your email",
      required: true,
    },
  ]);

  const handleSubmit = async () => {
    if (
      !title ||
      !description ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !locationText.trim() ||
      !category ||
      !venueType ||
      !eventPoster ||
      !eventBrochure ||
      !identityProof ||
      !permissionLetter ||
      !capacity ||
      !teamSize ||
      formFields.length === 0
    ) {
      toast.warning("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      // Basic event details
      formData.append("title", title);
      formData.append("description", description);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("startTime", startTime);
      formData.append("endTime", endTime);
      formData.append(
        "location",
        JSON.stringify({ text: locationText.trim(), googleMapLink })
      );
      formData.append("category", category);
      formData.append("venueType", venueType);
      formData.append("capacity", capacity);
      formData.append("isFree", JSON.stringify(isFree));
      formData.append("price", price);
      formData.append("teamSize", teamSize);
      formData.append("registrationDeadline", registrationDeadline);
      formData.append("registrationDeadlineTime", registrationDeadlineTime);
      formData.append("cancellationPolicy", cancellationPolicy);
      formData.append("allowRefunds", JSON.stringify(allowRefunds));

      // FAQ Section
      const faq = [faq1, faq2, faq3, faq4, faq5].filter(
        (f) => f.question && f.answer
      );
      formData.append("faq", JSON.stringify(faq));

      // 🟢 Add form title & description explicitly
      formData.append("formTitle", formTitle);
      formData.append("formDescription", formDescription);

      // 🟢 Match backend expected keys for form schema
      const formSchema = formFields.map((f) => ({
        type: f.typeOfQuestion, // backend likely expects 'type'
        label: f.question, // backend likely expects 'label'
        placeholder: f.placeholder || "",
        required: f.required || false,
        options:
          f.typeOfQuestion === "select" || f.typeOfQuestion === "checkbox"
            ? f.option
            : [],
      }));

      formData.append("form", JSON.stringify(formSchema));

      // Files (ensure backend field names match)
      formData.append("eventPoster", eventPoster);
      formData.append("identityProof", identityProof);
      formData.append("permissionLetter", permissionLetter);
      formData.append("eventBrochure", eventBrochure);

      const { data } = await axios.post(
        "http://localhost:8000/api/v2/events/register-event",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success(data.msg);
        // Reset form fields
        setTitle("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setStartTime("");
        setEndTime("");
        setLocationText("");
        setGoogleMapLink("");
        setCategory("Technical");
        setVenueType("offline");
        setIsFree(true);
        setPrice(0);
        setCapacity(0);
        setTeamSize(1);
        setRegistrationDeadline("");
        setRegistrationDeadlineTime("");
        setCancellationPolicy("No refunds after registration");
        setAllowRefunds(false);
        setEventPoster(null);
        setEventBrochure(null);
        setIdentityProof(null);
        setPermissionLetter(null);
        setFaq1({ question: "", answer: "" });
        setFaq2({ question: "", answer: "" });
        setFaq3({ question: "", answer: "" });
        setFaq4({ question: "", answer: "" });
        setFaq5({ question: "", answer: "" });
        setFormTitle("Registration Form");
        setFormDescription("");
        setFormFields([
          {
            id: Date.now(),
            typeOfQuestion: "text",
            question: "Full Name",
            placeholder: "Enter your full name",
            required: true,
          },
          {
            id: Date.now() + 1,
            typeOfQuestion: "email",
            question: "Email Address",
            placeholder: "Enter your email",
            required: true,
          },
        ]);
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4">
      {showGroupEventInfo && (
        <GroupEventInfoPopup onClose={() => setShowGroupEventInfo(false)} />
      )}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      )}
      <div className="w-full max-w-5xl mx-auto space-y-12">
        {/* Event Details Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-10"
        >
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Create New Event
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter event title (max 100 characters)"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your event (max 500 characters)"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none transition"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/500 characters
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Location <span className="text-red-500">*</span>
                </label>
                <input
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="Enter venue address"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps URL (Optional)
                </label>
                <input
                  value={googleMapLink}
                  onChange={(e) => setGoogleMapLink(e.target.value)}
                  placeholder="Enter Google Maps URL"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                >
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={venueType}
                  onChange={(e) => setVenueType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  min={0}
                  placeholder="Maximum participants"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Size <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  min={1}
                  placeholder="Team size (1 for individual)"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Deadline
                </label>
                <input
                  type="date"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Deadline Time
                </label>
                <input
                  type="time"
                  value={registrationDeadlineTime}
                  onChange={(e) => setRegistrationDeadlineTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Is Free Event <span className="text-red-500">*</span>
                </label>
                <select
                  value={isFree ? "true" : "false"}
                  onChange={(e) => setIsFree(e.target.value === "true")}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                >
                  <option value="true">Yes (Free)</option>
                  <option value="false">No (Paid)</option>
                </select>
              </div>
              {!isFree && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min={0}
                    step={0.01}
                    placeholder="Enter price per ticket"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Policy
                </label>
                <textarea
                  value={cancellationPolicy}
                  onChange={(e) => setCancellationPolicy(e.target.value)}
                  placeholder="Enter cancellation policy"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none transition"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowRefunds"
                  checked={allowRefunds}
                  onChange={(e) => setAllowRefunds(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-600"
                />
                <label
                  htmlFor="allowRefunds"
                  className="text-sm font-medium text-gray-700"
                >
                  Allow Refunds
                </label>
              </div>
            </div>
            <div className="space-y-8">
              <h2 className="text-lg font-semibold text-gray-900">FAQs</h2>
              {[faq1, faq2, faq3, faq4, faq5].map((faq, index) => (
                <div key={index} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      FAQ {index + 1} Question
                    </label>
                    <input
                      value={faq.question}
                      onChange={(e) => {
                        const newFaqs = [...[faq1, faq2, faq3, faq4, faq5]];
                        newFaqs[index] = { ...faq, question: e.target.value };
                        [setFaq1, setFaq2, setFaq3, setFaq4, setFaq5][index](
                          newFaqs[index]
                        );
                      }}
                      placeholder={`Question ${index + 1}`}
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer
                    </label>
                    <input
                      value={faq.answer}
                      onChange={(e) => {
                        const newFaqs = [...[faq1, faq2, faq3, faq4, faq5]];
                        newFaqs[index] = { ...faq, answer: e.target.value };
                        [setFaq1, setFaq2, setFaq3, setFaq4, setFaq5][index](
                          newFaqs[index]
                        );
                      }}
                      placeholder={`Answer ${index + 1}`}
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Registration Form Builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-10"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-8 flex items-center">
            Registration Form Builder
            <span
              className="ml-2 text-blue-600"
              title="Create custom questions for registrants"
            >
              <Info className="w-4 h-4" />
            </span>
          </h2>
          <FormBuilder
            formFields={formFields}
            setFormFields={setFormFields}
            formTitle={formTitle}
            setFormTitle={setFormTitle}
            formDescription={formDescription}
            setFormDescription={setFormDescription}
          />
        </motion.div>

        {/* File Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-10"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-8">
            Upload Documents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: "Event Poster *",
                state: eventPoster,
                setState: setEventPoster,
                accept: ".jpg,.png",
              },
              {
                label: "Identity Proof *",
                state: identityProof,
                setState: setIdentityProof,
                accept: ".pdf,.jpg,.png",
              },
              {
                label: "Permission Letter *",
                state: permissionLetter,
                setState: setPermissionLetter,
                accept: ".pdf,.jpg,.png",
              },
              {
                label: "Event Brochure *",
                state: eventBrochure,
                setState: setEventBrochure,
                accept: ".pdf,.jpg,.png",
              },
            ].map(({ label, state, setState, accept }, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-gray-200 p-6 hover:border-blue-300 transition"
              >
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {accept === ".jpg,.png"
                      ? "JPG, PNG (800x600px)"
                      : "PDF, JPG, PNG (max 5MB)"}
                  </p>
                </div>
                <div className="relative w-full">
                  <input
                    type="file"
                    id={`file-input-${index}`}
                    accept={accept}
                    onChange={(e) => setState(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center space-x-3">
                    <label
                      htmlFor={`file-input-${index}`}
                      className="px-4 py-2 rounded-full border-0 bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 cursor-pointer transition"
                    >
                      Choose File
                    </label>
                    <span className="text-sm text-gray-500 truncate max-w-[150px]">
                      {state ? state.name : "No file chosen"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Submit Button */}
        <div className="flex justify-center mt-10">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? "Submitting..." : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListEvent;

//code locked
