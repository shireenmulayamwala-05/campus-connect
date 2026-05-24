import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const Event = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationType, setNotificationType] = useState("Accepted");
  const [rejectionReason, setRejectionReason] = useState("");
  const [AcceptedReason, setAcceptedReason] = useState("");
  const [title, setTile] = useState("");
  const navigate = useNavigate();

  const getSinglePendingEvent = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/events/get-singlePendingEvent",
        { eventId },
        { withCredentials: true }
      );
      if (data.success) {
        setEvent(data.event);
        localStorage.setItem(`event_${eventId}`, JSON.stringify(data.event));
      } else {
        toast.error(data.msg || "Failed to fetch event details.");
        setEvent(null);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error(
        error.response?.data?.msg ||
          error.message ||
          "An unexpected error occurred."
      );
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!title || !AcceptedReason) {
      toast.warning("Please every notification feild");
      return;
    }
    try {
      //in this function we have to do 2 things
      //first  - > send the notification
      const { data } = await axios.post(
        "http://localhost:8000/api/notification/send-notification-toOrganizer",
        {
          userEmail: event.organizerEmail,
          title,
          message: AcceptedReason,
          from: "CampusConnect",
          typeOFNotification: "Approval",
        },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.msg);
      } else {
        toast.error(data.msg);
        return;
      }
      //second appload this event to approved event database/collection/table

      const response = await axios.post(
        "http://localhost:8000/api/events/upload-event",
        {
          title: event.title,
          organizerName: event.organizerName,
          organizerEmail: event.organizerEmail,
          organizerMobNo: event.organizerMobNo,
          dateOfEvent: event.dateOfEvent,
          timeOfEvent: event.timeOfEvent,

          hardcoded: event.location.hardcoded,
          googleMapLink: event.location.googleMapLink || "",

          upiOfOrganizer: event.upiOfOrganizer || "",
          intake: event.intake || 100,
          category: event.category,
          mode: event.mode,
          isEventPaid: event.isEventPaid || false,
          description: event.description,
          eventPoster: event.documents.eventPoster,
          faq: event.faq || [],
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.msg);
        //calling the api for deleting the current event from pending event achema
        const response2 = await axios.post(
          "http://localhost:8000/api/events/delete-pendingEvent",
          { eventId },
          { withCredentials: true }
        );
        if (response2.data.success) {
          toast.success(response2.data.msg);
          navigate("/pendingEvents");
        } else {
          toast.error(response2.data.msg);
        }
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = async () => {
    if (!title || !rejectionReason) {
      toast.warning("Please every notification feild");
      return;
    }
    try {
      //in this function we have to do 2 things
      //first  - > send the notification
      const { data } = await axios.post(
        "http://localhost:8000/api/notification/send-notification-toOrganizer",
        {
          userEmail: event.organizerEmail,
          title,
          message: rejectionReason,
          from: "CampusConnect",
          typeOFNotification: "Rejection",
        },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.msg);
      } else {
        toast.error(data.msg);
        return;
      }
      const response2 = await axios.post(
        "http://localhost:8000/api/events/delete-pendingEvent",
        { eventId },
        { withCredentials: true }
      );
      if (response2.data.success) {
        toast.success(response2.data.msg);
        navigate("/pendingEvents");
      } else {
        toast.error(response2.data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const storedEvent = localStorage.getItem(`event_${eventId}`);
    if (storedEvent) {
      try {
        setEvent(JSON.parse(storedEvent));
      } catch (error) {
        console.error("Error parsing localStorage event:", error);
      }
    }
    getSinglePendingEvent();
  }, [eventId]);

  if (isLoading) {
    return (
      <div
        className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <p className="text-[#0d141b] text-base font-normal leading-normal p-4">
                Loading...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div
        className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <p className="text-[#0d141b] text-base font-normal leading-normal p-4">
                No event data available.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#0d141b] tracking-light text-[32px] font-bold leading-tight min-w-72">
                Pending Event Details
              </p>
            </div>
            <h2 className="text-[#0d141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Event Overview
            </h2>
            <div className="p-4 grid grid-cols-2">
              <div className="flex flex-col gap-1 border-t border-solid border-t-[#cfdbe7] py-4 pr-2">
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  Event Title
                </p>
                <p className="text-[#0d141b] text-sm font-normal leading-normal">
                  {event?.title || "N/A"}
                </p>
              </div>
              <div className="flex flex-col gap-1 border-t border-solid border-t-[#cfdbe7] py-4 pl-2">
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  Organizer's Name
                </p>
                <p className="text-[#0d141b] text-sm font-normal leading-normal">
                  {event?.organizerName || "N/A"}
                </p>
              </div>
              <div className="flex flex-col gap-1 border-t border-solid border-t-[#cfdbe7] py-4 pr-2">
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  Organizer's Email
                </p>
                <p className="text-[#0d141b] text-sm font-normal leading-normal">
                  {event?.organizerEmail || "N/A"}
                </p>
              </div>
              <div className="flex flex-col gap-1 border-t border-solid border-t-[#cfdbe7] py-4 pl-2">
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  Organizer's Mobile Number
                </p>
                <p className="text-[#0d141b] text-sm font-normal leading-normal">
                  {event?.organizerMobNo
                    ? `+91-${event.organizerMobNo}`
                    : "N/A"}
                </p>
              </div>
              <div className="flex flex-col gap-1 border-t border-solid border-t-[#cfdbe7] py-4 pr-2">
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  Date of Event
                </p>
                <p className="text-[#0d141b] text-sm font-normal leading-normal">
                  {event?.dateOfEvent?.slice(0, 10) || "N/A"}
                </p>
              </div>
              <div className="flex flex-col gap-1 border-t border-solid border-t-[#cfdbe7] py-4 pl-2">
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  Time of Event
                </p>
                <p className="text-[#0d141b] text-sm font-normal leading-normal">
                  {event?.timeOfEvent || "N/A"}
                </p>
              </div>
              <div className="flex flex-col gap-1 border-t border-solid border-t-[#cfdbe7] py-4 pr-2">
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  Location / Venue
                </p>
                <p className="text-[#0d141b] text-sm font-normal leading-normal">
                  {event?.location?.hardcoded || "N/A"}
                </p>
              </div>
              <div className="flex flex-col gap-1 border-t border-solid border-t-[#cfdbe7] py-4 pl-2">
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  Category
                </p>
                <p className="text-[#0d141b] text-sm font-normal leading-normal">
                  {event?.category || "N/A"}
                </p>
              </div>
              <div className="flex flex-col gap-1 border-t border-solid border-t-[#cfdbe7] py-4 pr-2 col-span-2 pr-[50%]">
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  Mode
                </p>
                <p className="text-[#0d141b] text-sm font-normal leading-normal">
                  {event?.mode || "N/A"}
                </p>
              </div>
            </div>
            <h2 className="text-[#0d141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Event Description
            </h2>
            <p className="text-[#0d141b] text-base font-normal leading-normal pb-3 pt-1 px-4">
              {event?.description || "No description available."}
            </p>
            <h2 className="text-[#0d141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Document Verification
            </h2>
            <div className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-xl">
                <div className="flex flex-col gap-1 flex-[2_2_0px]">
                  <p className="text-[#4c739a] text-sm font-normal leading-normal">
                    Document Type: Identity Proof
                  </p>
                  <p className="text-[#0d141b] text-base font-bold leading-tight">
                    View or Download
                  </p>
                  <p className="text-[#4c739a] text-sm font-normal leading-normal">
                    File type: PDF, Size: 2MB
                  </p>
                </div>
                <a
                  href={event?.documents?.identityProof || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:cursor-pointer w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDQecqA-wQlS9z07eQFVndo71guUBC7wzqtmCGdmPY9to9GZemSvIgvO1RmQrWMg3aLeOYIVKzAj9WM4NuMFXfQelcYkLqPuRbMOM8PqXhtE9QA5XeXqqGndoM7cufH-feeOkWQO0Emy41bgSNChIsRe0eJ00JrqLlKvl5Zr6WmK3MceHDtnD8UtQnYnimPkZVR6WSv8NdqXhfRlej1G6HI04d_45seC6dT5icTaDdX8guglFS47BaT5ib5GelEGCOxjfcmrXdnDw")',
                  }}
                ></a>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-xl">
                <div className="flex flex-col gap-1 flex-[2_2_0px]">
                  <p className="text-[#4c739a] text-sm font-normal leading-normal">
                    Document Type: Permission Letters / NOCs
                  </p>
                  <p className="text-[#0d141b] text-base font-bold leading-tight">
                    View or Download
                  </p>
                  <p className="text-[#4c739a] text-sm font-normal leading-normal">
                    File type: PDF, Size: 3MB
                  </p>
                </div>
                <a
                  href={event?.documents?.permissionLetter || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBO1_AKfE81mWyvjg7YSW7C51lYi2-hnuIGiIqC7ZJz4h2FX7_3iNoZBaZBxrTEBDgvVaBow3SsLjkLz3FDS4_lM8SFXKE9O0eTr_EV67i6oNmtrPoOeIXjSLcQLuJocGTAb3SYJVfczJi54XtG1oUHARMhhtl1-QSEUK37jIYXXX95_4FnpnVd5phA3Kb1CZ28rqTaAUJHoW0fj1MP9SYHrdAA7Q-mNSAusxzfH16HQwvTjJkz-prIWeKgkdQImZpsvCUPAMCEWg")',
                  }}
                ></a>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-xl">
                <div className="flex flex-col gap-1 flex-[2_2_0px]">
                  <p className="text-[#4c739a] text-sm font-normal leading-normal">
                    Document Type: Event Brochure
                  </p>
                  <p className="text-[#0d141b] text-base font-bold leading-tight">
                    View or Download
                  </p>
                  <p className="text-[#4c739a] text-sm font-normal leading-normal">
                    File type: PDF, Size: 5MB
                  </p>
                </div>
                <a
                  href={event?.documents?.eventBrochure || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAW117Qus8fgXIHMY6gCZTXzbORbm5Ws3xMSjjs4xMRQ2AUnhhvVI7K8Qqxjm5mqrcC7hA6TKBwCx7LZb3thTTSZuhj3fSyl8ycr9b2J8gqfKVlnkOPgI9ebVUac7cg63T4RoSBsiN2U2WSGOusDXYcZVg0VcBIplltIO4lr--IRUTe9accMs7m3R0W7vvzC39Xcman21d6M7c2Ddi4YrenQM6kOZPDD85MCsS6goDvh7-TYsdNIvFMB1huM2Cp2fJNWbD0LCpvxw")',
                  }}
                ></a>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-xl">
                <div className="flex flex-col gap-1 flex-[2_2_0px]">
                  <p className="text-[#4c739a] text-sm font-normal leading-normal">
                    Document Type: Other
                  </p>
                  <p className="text-[#0d141b] text-base font-bold leading-tight">
                    View or Download
                  </p>
                  <p className="text-[#4c739a] text-sm font-normal leading-normal">
                    File type: PDF, Size: 4MB
                  </p>
                </div>
                <a
                  href={event?.documents?.other1 || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCWslFx8lm2dNAsZQdyrjvxrVwRxhkn0ulaL77X3Ly3S31vt9u3jBg5nER1IaW32mnRqYrSXxA7mELpq7iSQYImIzBbgkniKIcVM1KjMVmuIAqaOcyLd8DSq6vUKaRECUFByvSq79x7XpvOjJbw91ba4cw_mx8nKPHUNuhUtx3lsJRYc5BLpWj-J7mQOgOZCs9OCz4Xr8GcX4EbqXQr2ZNZ9LzqWFWxx1pi7-oUD8s7Te7SFsb52j2zEt18yO5UBbXZQgunxsvFwQ")',
                  }}
                ></a>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-xl">
                <div className="flex flex-col gap-1 flex-[2_2_0px]">
                  <p className="text-[#4c739a] text-sm font-normal leading-normal">
                    Document Type: Other Documents
                  </p>
                  <p className="text-[#0d141b] text-base font-bold leading-tight">
                    View or Download
                  </p>
                  <p className="text-[#4c739a] text-sm font-normal leading-normal">
                    File type: PDF, Size: 2MB
                  </p>
                </div>
                <a
                  href={event?.documents?.other2 || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA1iwpPuSorB3DxL7yW5WGCNb5RjfFe1bp5ZM4fOxREHIa-27kHR19zIYQQ3477UdgOytaAPFBTMNy9n735oUKfHhe3LddrgskhGyqPY9N_xxXzTmnPrIB7F7P8B8xF8Ok-WcrarZSTehyCNOr5zD3iJBuS_0NmXEtvUXoagGpsHhU0jRM9rYBjB9_OAoKtoISh1aOAgalG94vE4hQ_zTHsQRMlHs7n3tYI5XhgDpxJhABzQuu4Agdbd3QRnF9CwfZ8YcmRt5OiEg")',
                  }}
                ></a>
              </div>
            </div>

            <h2 className="text-[#0d141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Send Notification
            </h2>
            <div className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-[#4c739a] text-sm font-normal leading-normal">
                    Notification Type
                  </p>
                  <select
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value)}
                    className="border border-[#cfdbe7] rounded-md p-2 text-[#0d141b] text-sm font-normal leading-normal"
                  >
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  Title
                </p>
                <input
                  value={title}
                  onChange={(e) => setTile(e.target.value)}
                  type="text"
                  placeholder="Enter title "
                  className="border border-[#cfdbe7] rounded-md p-2 text-[#0d141b] text-sm font-normal leading-normal resize-y"
                />
                {notificationType === "Rejected" && (
                  <div className="flex flex-col gap-1">
                    <p className="text-[#4c739a] text-sm font-normal leading-normal">
                      Reason for Rejection
                    </p>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection"
                      className="border border-[#cfdbe7] rounded-md p-2 text-[#0d141b] text-sm font-normal leading-normal resize-y"
                      rows="4"
                    ></textarea>
                  </div>
                )}
                {notificationType === "Accepted" && (
                  <div className="flex flex-col gap-1">
                    <p className="text-[#4c739a] text-sm font-normal leading-normal">
                      Reason for Approval
                    </p>
                    <textarea
                      value={AcceptedReason}
                      onChange={(e) => setAcceptedReason(e.target.value)}
                      placeholder="Enter reason for Approval "
                      className="border border-[#cfdbe7] rounded-md p-2 text-[#0d141b] text-sm font-normal leading-normal resize-y"
                      rows="4"
                    ></textarea>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-stretch">
              <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-end">
                <button
                  onClick={handleApprove}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#2789ec] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Approve</span>
                </button>
                <button
                  onClick={handleReject}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e7edf3] text-[#0d141b] text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Reject</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event;
