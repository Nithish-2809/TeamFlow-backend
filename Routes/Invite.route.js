const express = require("express");
const restrictToLoggedinUserOnly = require("../Middlewares/AuthZ.middleware");
const {
  createInviteLink,
  validateInvite,
  joinViaLink
} = require("../Controllers/Invite.controller");

const inviteRouter = express.Router({ mergeParams: true });

inviteRouter.post("/", createInviteLink);
inviteRouter.get("/:token", validateInvite);
inviteRouter.post("/:token/join", restrictToLoggedinUserOnly, joinViaLink);

module.exports = inviteRouter;
