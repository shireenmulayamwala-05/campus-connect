import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserContext } from "../context/UserContext";

const EventRegistrationForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrationType, setRegistrationType] = useState("individual");
  const [groupCode, setGroupCode] = useState("");
  const [team, setTeam] = useState(null);

  // Get userId from user context
  const userId = user?._id;

  // Create dynamic form schema based on event data
  const createFormSchema = () => {
    if (!event || !event.form) return z.object({});

    const schemaFields = {};
    event.form.forEach((field) => {
      let validator;
      switch (field.typeOfQuestion) {
        case "text":
          validator = z.string().min(1, "Required");
          break;
        case "email":
          validator = z.string().email("Invalid email").min(1, "Required");
          break;
        case "phone":
          validator = z
            .string()
            .regex(/^\d{10}$/, "Invalid phone number")
            .min(1, "Required");
          break;
        case "number":
          validator = z.number().min(0, "Invalid number");
          break;
        case "select":
          validator = z.string().min(1, "Required");
          break;
        case "checkbox":
          validator = z.array(z.string()).min(1, "Select at least one");
          break;
        case "date":
          validator = z.date();
          break;
        case "file":
          validator = z.instanceof(File, "File required");
          break;
        default:
          validator = z.string().min(1, "Required");
      }
      schemaFields[field.question] = validator;
    });

    return z.object(schemaFields);
  };

  const formSchema = createFormSchema();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: event
      ? (event.form || []).reduce((acc, field) => {
          acc[field.question] = field.typeOfQuestion === "checkbox" ? [] : "";
          return acc;
        }, {})
      : {},
    mode: "onChange",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log("Fetching event with ID:", eventId);

        if (!eventId || !/^[0-9a-fA-F]{24}$/.test(eventId)) {
          toast.error("Invalid event ID format");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:8000/api/v2/events/approved-events/${eventId}`,
          { withCredentials: true }
        );
        console.log("Event fetch response:", res.data);
        if (res.data.success) {
          setEvent(res.data.event);
        } else {
          toast.error(res.data.msg || "Failed to fetch event details");
        }
      } catch (err) {
        console.error("Event fetch error:", err);
        if (err.response?.status === 404) {
          toast.error("Event not found");
        } else if (err.response?.status === 400) {
          toast.error("Invalid event ID");
        } else {
          toast.error(
            err.response?.data?.msg || "Failed to fetch event details"
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    if (event && event.form) {
      const defaultValues = (event.form || []).reduce((acc, field) => {
        acc[field.question] = field.typeOfQuestion === "checkbox" ? [] : "";
        return acc;
      }, {});
      reset(defaultValues);
    }
  }, [event, reset]);

  useEffect(() => {
    if (event) {
      if (event.teamSize > 1) {
        setRegistrationType("group");
      } else {
        setRegistrationType("individual");
      }
    }
  }, [event]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (loading || !event) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-white to-blue-50">
        <svg
          className="animate-spin h-12 w-12 text-violet-600"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-white to-blue-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h2 className="text-3xl font-bold text-violet-900 mb-4">
            Please Login
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to register for events.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:from-blue-700 hover:to-violet-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!event.title) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-white to-blue-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h2 className="text-3xl font-bold text-violet-900 mb-4">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/events")}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:from-blue-700 hover:to-violet-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const fetchTeam = async () => {
    if (!groupCode.trim()) {
      toast.error("Please enter a group code");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching team with:", {
        groupCode,
        teamSize: event.teamSize,
      });

      const res = await axios.get(
        `http://localhost:8000/api/v1/group/get-group-member?groupCode=${encodeURIComponent(
          groupCode.trim()
        )}&teamSize=${event.teamSize}`,
        { withCredentials: true }
      );

      console.log("Team fetch response:", res.data);

      if (res.data.success) {
        setTeam(res.data.team);
        console.log(res.data.team);
        toast.success("Team details fetched successfully!");
      } else {
        console.error("Team fetch failed:", res.data);
        toast.error(res.data.msg || "Failed to fetch team details");
      }
    } catch (err) {
      console.error("Team fetch error:", err);
      console.error("Error response:", err.response?.data);

      if (err.response?.status === 401) {
        toast.error("You are not authorized to access this group");
      } else if (err.response?.status === 404) {
        toast.error("Group not found. Please check your group code");
      } else if (err.response?.status === 400) {
        toast.error(
          err.response?.data?.msg || "Invalid group code or team size mismatch"
        );
      } else {
        toast.error(
          err.response?.data?.msg ||
            "Error fetching team details. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const processResponses = async (values) => {
    const processed = [];
    for (const [question, answer] of Object.entries(values)) {
      const field = (event.form || []).find((f) => f.question === question);
      let ans = answer;
      if (field.typeOfQuestion === "file" && answer instanceof File) {
        ans = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(answer);
        });
      } else if (field.typeOfQuestion === "checkbox" && Array.isArray(answer)) {
        ans = answer.join(", ");
      } else if (field.typeOfQuestion === "date" && answer instanceof Date) {
        ans = answer.toISOString();
      } else if (field.typeOfQuestion === "number") {
        ans = answer.toString();
      } else {
        ans = String(answer);
      }
      processed.push({
        questionId: field._id || question,
        answer: ans,
      });
    }
    return processed;
  };

  const onSubmit = async (values) => {
    console.log("Form submitted with values:", values);
    console.log("Event form fields:", event.form);

    if (registrationType === "group" && !team) {
      toast.error("Please fetch team details first");
      return;
    }

    if (registrationType === "group" && !groupCode) {
      toast.error("Please enter a group code");
      return;
    }

    setLoading(true);
    try {
      const responses = await processResponses(values);

      if (event.isFree) {
        const payload = {
          eventId: eventId,
          registrationType,
          responses,
        };
        if (registrationType === "group") {
          payload.team = team;
        }
        await axios.post(
          "http://localhost:8000/api/v1/register/registerInEvent",
          payload,
          { withCredentials: true }
        );
        toast.success("Registration successful");
      } else {
        console.log("Creating Razorpay order for amount:", event.price);

        const orderRes = await axios.post(
          "http://localhost:8000/api/v1/payment/create-order",
          {
            amount: event.price,
          },
          { withCredentials: true }
        );

        console.log("Order creation response:", orderRes.data);

        if (!orderRes.data.success) {
          toast.error(orderRes.data.msg || "Failed to create payment order");
          return;
        }

        const order = orderRes.data.order;

        const options = {
          key: "rzp_test_RIJ8fTLUFb3UNC",
          amount: order.amount,
          currency: order.currency || "INR",
          name: event.title,
          description: event.description,
          order_id: order.id,
          handler: async (response) => {
            console.log("Razorpay payment response:", response);
            const verifyPayload = {
              eventId: eventId,
              registrationType,
              responses,
              userId,
              amount: event.price,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };
            if (registrationType === "group") {
              verifyPayload.group = team;
            }
            const verifyRes = await axios.post(
              "http://localhost:8000/api/v1/payment/verify",
              verifyPayload,
              { withCredentials: true }
            );
            if (verifyRes.data.success) {
              toast.success("Payment and registration successful");
              navigate(`/event/${eventId}`);
            } else {
              toast.error("Payment verification failed");
            }
          },
          theme: {
            color: "#3B82F6",
          },
        };

        try {
          if (!window.Razorpay) {
            toast.error(
              "Payment gateway is still loading. Please wait a moment and try again."
            );
            return;
          }

          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (error) {
          console.error("Error opening Razorpay popup:", error);
          toast.error("Failed to open payment gateway. Please try again.");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field, name, type, options = [], placeholder) => {
    switch (type) {
      case "text":
      case "email":
      case "phone":
      case "number":
        return (
          <input
            type={type}
            placeholder={placeholder || `Enter ${type}`}
            {...register(name, { valueAsNumber: type === "number" })}
            className="w-full p-4 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white text-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
          />
        );
      case "select":
        return (
          <select
            {...register(name)}
            className="w-full p-4 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white text-gray-800 transition-all duration-300 shadow-sm hover:shadow-md appearance-none"
          >
            <option value="" disabled>
              {placeholder || "Select an option"}
            </option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="space-y-3 p-4 border border-blue-100 rounded-xl bg-blue-50/50">
            {options.map((opt) => (
              <label
                key={opt}
                className="flex items-center space-x-3 cursor-pointer hover:bg-blue-100/50 p-2 rounded-xl transition-all duration-300"
              >
                <input
                  type="checkbox"
                  value={opt}
                  {...register(name)}
                  onChange={(e) => {
                    const current = getValues(name) || [];
                    if (e.target.checked) {
                      setValue(name, [...current, opt]);
                    } else {
                      setValue(
                        name,
                        current.filter((v) => v !== opt)
                      );
                    }
                  }}
                  className="h-5 w-5 text-violet-600 focus:ring-violet-400 border-blue-200 rounded"
                />
                <span className="text-gray-700 font-medium">{opt}</span>
              </label>
            ))}
          </div>
        );
      case "date":
        return (
          <input
            type="date"
            {...register(name, {
              valueAsDate: true,
            })}
            className="w-full p-4 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white text-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
          />
        );
      case "file":
        return (
          <div className="relative">
            <input
              type="file"
              {...register(name)}
              className="w-full p-4 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white text-gray-800 transition-all duration-300 shadow-sm hover:shadow-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
        );
      default:
        return (
          <input
            type="text"
            placeholder={placeholder || "Enter text"}
            {...register(name)}
            className="w-full p-4 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white text-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Event Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 mb-6 tracking-tight">
              {event.title}
            </h1>
            <p className="text-gray-700 text-lg leading-relaxed max-w-3xl">
              {event.description}
            </p>

            {/* Event Details */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gradient-to-r from-blue-50 to-violet-50 p-6 rounded-2xl shadow-md">
              <div className="flex items-center space-x-4">
                <span className="text-blue-600 text-2xl">📅</span>
                <div>
                  <p className="text-gray-700 font-semibold">Date</p>
                  <p className="text-gray-600">
                    {new Date(event.startDate).toLocaleDateString()} -{" "}
                    {new Date(event.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-blue-600 text-2xl">⏰</span>
                <div>
                  <p className="text-gray-700 font-semibold">Time</p>
                  <p className="text-gray-600">
                    {event.startTime} - {event.endTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-blue-600 text-2xl">📍</span>
                <div>
                  <p className="text-gray-700 font-semibold">Location</p>
                  <p className="text-gray-600">{event.location?.hardcoded}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-blue-600 text-2xl">💰</span>
                <div>
                  <p className="text-gray-700 font-semibold">Price</p>
                  <p className="text-gray-600 font-semibold">
                    {event.isFree ? "Free" : `₹${event.price}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-10"
            key={event._id}
          >
            {/* Registration Type Info */}
            <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-violet-600 text-2xl">
                  {registrationType === "group" ? "👥" : "👤"}
                </span>
                <h3 className="text-xl font-semibold text-violet-900">
                  {registrationType === "group"
                    ? `Group Registration (Team Size: ${event.teamSize})`
                    : "Individual Registration"}
                </h3>
              </div>
              <p className="text-violet-700 text-base">
                {registrationType === "group"
                  ? "This event requires group registration. Please provide a group code below to fetch your team details."
                  : "This event is for individual participants only."}
              </p>
            </div>
            {registrationType === "group" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <input
                    type="text"
                    placeholder="Enter Group Code"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value)}
                    className="flex-1 p-4 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white text-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                  <button
                    type="button"
                    onClick={fetchTeam}
                    disabled={loading || !groupCode.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    {loading ? "Loading..." : "Get Team"}
                  </button>
                </div>
                {team && (
                  <div className="border border-violet-100 bg-gradient-to-r from-blue-50/50 to-violet-50/50 p-8 rounded-2xl shadow-md max-w-3xl mx-auto">
                    <h3 className="font-semibold text-violet-900 text-2xl mb-6">
                      ✅ Team Details
                    </h3>
                    <div className="space-y-5 text-violet-800">
                      <p>
                        <span className="font-medium">Group Code:</span>{" "}
                        {team.groupCode}
                      </p>
                      <p>
                        <span className="font-medium">Leader:</span>{" "}
                        {team.leaderName} ({team.leaderEmail})
                      </p>
                      <p>
                        <span className="font-medium">Team Size:</span>{" "}
                        {team.members.length}
                      </p>
                      <div>
                        <p className="font-medium mb-3">Members:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          {team.members.map((member, idx) => (
                            <li key={idx}>
                              {member.userName} ({member.email})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {(event.form || []).length > 0 ? (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 mb-6">
                  Registration Form
                </h2>
                {(event.form || []).map((field) => (
                  <div key={field.question} className="space-y-3">
                    <label className="block text-lg font-semibold text-gray-800">
                      {field.question}
                      {field.typeOfQuestion !== "checkbox" && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {renderInput(
                      field,
                      field.question,
                      field.typeOfQuestion,
                      field.option,
                      field.placeholder
                    )}
                    {errors[field.question] && (
                      <p className="text-red-500 text-sm mt-1 bg-red-50 p-2 rounded-xl">
                        {errors[field.question].message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-blue-50/50 rounded-2xl">
                <p className="text-gray-600 text-xl font-medium">
                  No registration form required for this event.
                </p>
              </div>
            )}
            {/* Submit Button */}
            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-6 w-6 mr-3 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    {event.isFree ? (
                      <>
                        <span className="mr-3 text-2xl">✅</span>
                        Register for Free
                      </>
                    ) : (
                      <>
                        <span className="mr-3 text-2xl">💳</span>
                        Pay ₹{event.price} & Register
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationForm;
