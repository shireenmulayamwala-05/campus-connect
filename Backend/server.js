const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const connectDb = require("./config/connectDb");
const userRouter = require("./routes/userRouter");
const cookieParser = require("cookie-parser");
const eventRouter = require("./routes/eventRouter.js");
// const eventRouterV2 = require("./routes/eventRouterV2.js");
const adminRouter = require("./routes/adminRouter.js");
const notificationRouter = require("./routes/notificationRouter.js");
const groupRouter = require("./routes/groupRouter.js");
const userAuth = require("./middlewear/userAuth.js");
const razorpayRouter = require("./routes/razorpayRouter.js");
const registrationRouter = require("./routes/registrationRouter.js");
const userDashBoardRouter = require("./routes/userDashboardRouter.js");
const app = express();
app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // frontend origin
    credentials: true,
  })
);

connectDb();

app.get("/", (req, res) => {
  res.send("Server working");
});

app.use("/api/user", userRouter);
// app.use("/api/events", eventRouter);
app.use("/api/v2/events", eventRouter);
app.use("/api/admin", adminRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/v1/group", groupRouter);
app.use("/api/v1/payment", razorpayRouter);
app.use("/api/v1/register", registrationRouter);
app.use("/api/v1/user/dashboard", userDashBoardRouter);
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
