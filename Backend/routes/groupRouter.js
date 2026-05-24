const express = require("express");
const {
  getMember,
  createGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  leaveGroup,
  getGroupMember,
} = require("../controllers/groupControllers");
const userAuth = require("../middlewear/userAuth");
const groupRouter = express.Router();
groupRouter.get("/get-member", userAuth, getMember);
groupRouter.post("/create-group", userAuth, createGroup);
groupRouter.delete("/delete-group/:groupCode", userAuth, deleteGroup);
groupRouter.post("/add-member", userAuth, addGroupMember);
groupRouter.post("/remove-member", userAuth, removeGroupMember);
groupRouter.post(
  "/leave",
  userAuth,
  require("../controllers/groupControllers").leaveGroup
);
groupRouter.get(
  "/my-groups",
  userAuth,
  require("../controllers/groupControllers").listMyGroups
);
groupRouter.post("/leave-group", userAuth, leaveGroup);
groupRouter.get("/get-group-member", userAuth, getGroupMember);

module.exports = groupRouter;
