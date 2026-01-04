const express = require("express");
const isBoardAdmin = require("../Middlewares/isBoardAdmin.middleware");
const { createInviteLink } = require("../Controllers/Invite.controller");

const inviteRouter = express.Router({ mergeParams: true });

inviteRouter
.post("/", createInviteLink);

module.exports = inviteRouter;
