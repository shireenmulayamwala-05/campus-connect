const adminCollection = require("../models/adminModel");
const approvedEventsCollection = require("../models/approvedEventsModel");
const EventCollection = require("../models/EventModel");
const PendingEventCollection = require("../models/pendingEvents");
const userCollection = require("../models/userModel");
const mongoose = require("mongoose");

// const createEvent = async (req, res) => {
//   try {
//     const organizerId = req.id;
//     console.log(organizerId) ;
//     const user = await userCollection.findById(organizerId);
//     if (!user) {
//       return res.json({
//         success: false,
//         msg: "Invalid user",
//       });
//     }
//     if (!user.isVerified) {
//       return res.json({
//         success: false,
//         msg: "Please verify your email",
//       });
//     }
//     const organizerName = user.userName;
//     const organizerEmail = user.email;
//     const organizerMobNo = user.mobileNo;
//     const {
//       title,
//       dateOfEvent,
//       timeOfEvent,
//       hardcoded,
//       googleMapLink,
//       category,
//       mode,
//       isEventPaid,
//       description,
//       faq,
//     } = req.body;

//     //accessing thee files uploaded to cloudinary
//     const files = req.files;
//     const eventPoster = files?.eventPoster?.[0]?.path || null;
//     const identityProof = files?.identityProof?.[0]?.path || null;
//     const permissionLetter = files?.permissionLetter?.[0]?.path || null;
//     const eventBrochure = files?.eventBrochure?.[0]?.path || null;
//     //optional
//     const other1 = files?.other1?.[0]?.path || null;
//     const other2 = files?.other2?.[0]?.path || null;
//     const other3 = files?.other3?.[0]?.path || null;

//     if (!eventPoster || !identityProof || !permissionLetter || !eventBrochure) {
//       res.json({
//         success: false,
//         msg: "Required documents (eventPoster, identityProof, permissionLetter) must be uploaded",
//       });
//     }

//     const newEvent = await PendingEventCollection({
//       title,
//       organizerName,
//       organizerEmail,
//       organizerMobNo,
//       dateOfEvent,
//       timeOfEvent,
//       location: {
//         hardcoded,
//         googleMapLink,
//       },
//       category,
//       mode,
//       isEventPaid: Boolean(isEventPaid),
//       description,
//       faq: JSON.parse(faq),
//       documents: {
//         eventPoster,
//         identityProof,
//         permissionLetter,
//         eventBrochure,
//         other1,
//         other2,
//         other3,
//       },
//       organizerId,
//     });
//     await newEvent.save();
//     res.json({
//       success: true,
//       msg: "Event send for verification successfully",
//       event: newEvent,
//     });
//   } catch (error) {
//     res.json({
//       success: false,
//       msg: error.message,
//     });
//   }
// };

// Register Event

const createEvent = async (req, res) => {
  try {
    const organizerId = req.id;
    const user = await userCollection.findById(organizerId);

    if (!user) {
      return res.status(500).json({ success: false, msg: "Invalid user" });
    }
    if (!user.isVerified) {
      return res.json({ success: false, msg: "Please verify your email" });
    }

    // Organizer Info
    const organizerName = user.userName;
    const organizerEmail = user.email;
    const organizerMobNo = user.mobileNo;

    // Extract body
    const {
      title,
      description,
      category,
      venueType,
      location,
      startDate,
      endDate,
      startTime,
      endTime,
      registrationDeadline,
      registrationDeadLineTime,
      capacity,
      isFree,
      price,
      cancellationPolicy,
      allowRefunds,
      teamSize,
      faq,
      form, // form fields as JSON string
    } = req.body;

    // Access uploaded files
    const files = req.files;
    const eventPoster = files?.eventPoster?.[0]?.path || null;
    const identityProof = files?.identityProof?.[0]?.path || null;
    const permissionLetter = files?.permissionLetter?.[0]?.path || null;
    const eventBrochure = files?.eventBrochure?.[0]?.path || null;

    if (!eventPoster || !identityProof || !permissionLetter || !eventBrochure) {
      return res.json({
        success: false,
        msg: "Required documents (eventPoster, identityProof, permissionLetter, eventBrochure) must be uploaded",
      });
    }

    // Normalize/parse inputs coming from multipart form-data
    const parsedLocation =
      typeof location === "string"
        ? (() => {
            try {
              return JSON.parse(location);
            } catch {
              return {};
            }
          })()
        : location;

    const isFreeBoolean = isFree === true || isFree === "true";

    if (!parsedLocation?.text) {
      return res.json({
        success: false,
        msg: "Event validation failed: location.text is required",
      });
    }

    // New Event object
    const newEvent = new EventCollection({
      organizerId,
      title,
      description,
      organizerName,
      organizerEmail,
      organizerMobNo,
      category,
      venueType,
      location: {
        hardcoded: parsedLocation?.text,
        googleMapLink: parsedLocation?.googleMapLink,
      },
      startDate,
      endDate,
      startTime,
      endTime,
      registrationDeadline,
      registrationDeadLineTime,
      capacity,
      isFree: isFreeBoolean,
      price: isFreeBoolean ? 0 : price,
      cancellationPolicy: cancellationPolicy || "No refunds after registration",
      allowRefunds: Boolean(allowRefunds),
      teamSize,
      faq: (() => {
        try {
          return faq ? JSON.parse(faq) : [];
        } catch {
          return [];
        }
      })(),
      form: (() => {
        try {
          return form ? JSON.parse(form) : [];
        } catch {
          return [];
        }
      })(),
      documents: {
        eventPoster,
        identityProof,
        permissionLetter,
        eventBrochure,
      },
    });

    await newEvent.save();

    res.json({
      success: true,
      msg: "Event submitted for verification successfully",
      event: newEvent,
    });
  } catch (error) {
    res.json({
      success: false,
      msg: error.message,
    });
  }
};

const getPendingEvents = async (req, res) => {
  try {
    const adminId = req.adminId;
    const adminExist = await adminCollection.findById(adminId);
    if (!adminExist) {
      return res.json({
        success: false,
        msg: "Invalid Admin",
      });
    }
    const pendingEvents = await PendingEventCollection.find();
    res.json({
      success: true,
      msg: "Pending Events fetched successfully",
      pendingEvents,
    });
  } catch (error) {
    res.json({
      success: false,
      msg: error.message,
    });
  }
};
const getSinglePendinEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const eventExist = await PendingEventCollection.findById(eventId);
    if (!eventExist) {
      return res.json({
        success: false,
        msg: "Invalid Event Id",
      });
    }
    res.json({
      success: true,
      msg: "Event fetched successfully",
      event: eventExist,
    });
  } catch (error) {
    res.status().json({
      success: false,
      msg: error.message,
    });
  }
};
const uploadEventOnApprovedEvent = async (req, res) => {
  try {
    const {
      title,
      organizerName,
      organizerEmail,
      organizerMobNo,
      dateOfEvent,
      timeOfEvent,
      hardcoded,
      googleMapLink,
      upiOfOrganizer,
      category,
      mode,
      isEventPaid,
      description,
      eventPoster,
      faq,
    } = req.body;
    // console.log(organizerEmail);?
    const organizer = await userCollection.findOne({ email: organizerEmail });
    // console.log(organizer);
    const organizerId = organizer._id;
    const newEvent = approvedEventsCollection({
      title,
      organizerName,
      organizerEmail,
      organizerMobNo,
      dateOfEvent,
      timeOfEvent,
      location: {
        hardcoded,
        googleMapLink,
      },
      upiOfOrganizer,
      category,
      mode,
      isEventPaid,
      description,
      eventPoster,
      faq,
      organizerId,
    });
    await newEvent.save();
    res.status(200).json({
      success: true,
      msg: "Event is live!!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
const deleteOnePendingEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    // Ensure eventId is a valid ObjectId
    if (!eventId) {
      return res.status(400).json({
        success: false,
        msg: "Event ID is required",
      });
    }

    const isDeleted = await PendingEventCollection.deleteOne({ _id: eventId });

    if (isDeleted.deletedCount === 1) {
      return res.json({
        success: true,
        msg: "Event removed from pending events",
      });
    } else {
      return res.json({
        success: false,
        msg: "Event not found or already deleted",
      });
    }
  } catch (error) {
    res.json({
      success: false,
      msg: error.message,
    });
  }
};

const getApprovedEvent = async (req, res) => {
  try {
    // Pagination params: default to page=1, limit=50 (cap limit at 100)
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100);
    const skip = (page - 1) * limit;

    // Filter to only get approved/verified events
    const filter = { isVerified: true };

    // Fetch paginated events and total count in parallel
    const [events, total] = await Promise.all([
      EventCollection.find(filter)
        .sort({ startDate: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EventCollection.countDocuments(filter),
    ]);

    res.json({
      success: true,
      msg: "Approved Events Fetched Successfully",
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.json({
      success: false,
      msg: error.message,
    });
  }
};

const getSingleApprovedEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid Event Id" });
    }

    const event = await EventCollection.findById(id).lean();

    if (!event) {
      return res.status(404).json({ success: false, msg: "Event not found" });
    }

    return res.status(200).json({
      success: true,
      msg: "Event Fetched Successfully",
      event,
    });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};

const getOrganizedEvents = async (req, res) => {
  try {
    const userId = req.id; // from userAuth

    const user = await userCollection
      .findById(userId)
      .populate(
        "organizedEvents",
        "title description category startDate endDate startTime endTime documents.eventPoster"
      ) // select only required fields
      .select("organizedEvents");

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "Invalid user id",
      });
    }

    if (!user.organizedEvents || user.organizedEvents.length === 0) {
      return res.status(200).json({
        success: true,
        msg: "No events organized",
        organizedEvents: [],
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Organized Events fetched successfully",
      organizedEvents: user.organizedEvents,
    });
  } catch (error) {
    console.error("Error in getOrganizedEvents:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
};
const getParticipatedEvents = async (req, res) => {
  try {
    const userId = req.id;

    const user = await userCollection
      .findById(userId)
      .populate(
        "registeredEvents",
        "title description category startDate endDate startTime endTime documents.eventPoster"
      )
      .select("registeredEvents");

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "Invalid user id",
      });
    }

    let events = user.registeredEvents || [];

    // Remove duplicate events based on _id
    const uniqueEventsMap = new Map();
    events.forEach((event) => {
      uniqueEventsMap.set(event._id.toString(), event);
    });
    const uniqueEvents = Array.from(uniqueEventsMap.values());

    if (uniqueEvents.length === 0) {
      return res.status(200).json({
        success: true,
        msg: "No participated events found",
        participatedEvents: [],
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Participated events fetched successfully",
      participatedEvents: uniqueEvents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

module.exports = {
  createEvent,
  getPendingEvents,
  getSinglePendinEvent,
  uploadEventOnApprovedEvent,
  deleteOnePendingEvent,
  getApprovedEvent,
  getSingleApprovedEvent,
  getOrganizedEvents,
  getParticipatedEvents,
};
