const express = require("express");
const {
  createInviteLink,
  validateInvite
} = require("../Controllers/Invite.controller");

const inviteRouter = express.Router({ mergeParams: true });

inviteRouter.post("/", createInviteLink);
inviteRouter.get("/:token", validateInvite);

module.exports = inviteRouter;
