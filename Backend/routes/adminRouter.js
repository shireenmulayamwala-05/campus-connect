const express = require("express");
const {
  adminLogin,
  adminRegistration,
} = require("../controllers/adminController");
const { logout } = require("../controllers/userController");
const adminAuth = require("../middlewear/adminAuth");
const adminRouter = express.Router();
adminRouter.post("/register", adminRegistration);
adminRouter.post("/login", adminLogin);
adminRouter.post("/logout", adminAuth, logout);
module.exports = adminRouter;
