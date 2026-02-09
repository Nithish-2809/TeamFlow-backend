const express = require("express");
const restrictToLoggedinUserOnly = require("../Middlewares/AuthZ.middleware");
const {
  createInviteLink,
  validateInvite,
  joinViaLink
} = require("../Controllers/Invite.controller");

const inviteRouter = express.Router({ mergeParams: true });

// NOTE: These routes are now ONLY used for the public /invite/:token routes
// The /:boardId/invite route is handled directly in Board.route.js

// GET /invite/:token - Validate invite token (PUBLIC)
inviteRouter.get("/:token", validateInvite);

// POST /invite/:token/join - Join via invite link (REQUIRES AUTH ONLY)
inviteRouter.post("/:token/join", restrictToLoggedinUserOnly, joinViaLink);

module.exports = inviteRouter;