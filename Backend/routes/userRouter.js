const express = require("express");
const {
  register,
  login,
  setResetOtp,
  checkResetOtp,
  setVerificationOtp,
  checkVerifyOtp,
  getUser,
  logout,
} = require("../controllers/userController");
const { upload } = require("../config/cloudinary");
const userAuth = require("../middlewear/userAuth"); // Fixed typo: "middlewear" → "middleware"
const userRouter = express.Router();

userRouter.post("/register", upload.single("profilePic"), register); // Apply multer middleware for profilePic
userRouter.post("/login", login);
userRouter.post("/reset-otp", setResetOtp);
userRouter.post("/verify-otp", setVerificationOtp);
userRouter.post("/check-reset-otp", checkResetOtp);
userRouter.post("/check-verify-otp", checkVerifyOtp);
userRouter.get("/get-user", userAuth, getUser);
userRouter.post("/logout", userAuth, logout);

module.exports = userRouter;
