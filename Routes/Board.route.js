const express = require("express");

const {
  createBoard,
  myBoards,
  getBoardById,
  renameBoard,
  deleteBoard,
  pendingBoards
} = require("../Controllers/Board.controller");

const {
  acceptInviteRequest,
  rejectInviteRequest,
  removeBoardMember,
  leaveBoard,
  makeBoardAdmin,
  getBoardMembers,
  getPendingMembers
} = require("../Controllers/BoardMembership.controller");

const {
  createInviteLink,
  validateInvite,
  joinViaLink
} = require("../Controllers/Invite.controller");

const restrictToLoggedinUserOnly = require("../Middlewares/AuthZ.middleware");
const isBoardMember = require("../Middlewares/isBoardMember.middleware");
const isBoardAdmin = require("../Middlewares/isBoardAdmin.middleware");

const listRouter = require("./List.route");
const chatRouter = require("./Chat.route");

const boardRouter = express.Router();

// ==========================
// APPLY AUTH TO ALL ROUTES
// ==========================
boardRouter.use(restrictToLoggedinUserOnly);

// ==========================
// GLOBAL BOARD ROUTES (NO BOARD ID)
// ==========================
boardRouter.post("/create", createBoard);
boardRouter.get("/", myBoards);
boardRouter.get("/pending-boards", pendingBoards);

// ==========================
// PUBLIC INVITE ROUTES (NO MEMBERSHIP REQUIRED)
// These must be BEFORE the /:boardId routes
// ==========================
boardRouter.get("/invite/:token", validateInvite);
boardRouter.post("/invite/:token/join", joinViaLink);

// ==========================
// BOARD DETAILS (MEMBERS ONLY)
// ==========================
boardRouter.get("/:boardId", isBoardMember, getBoardById);

// ==========================
// BOARD MANAGEMENT (ADMIN ONLY)
// ==========================
boardRouter.patch("/:boardId/rename", isBoardMember, isBoardAdmin, renameBoard);
boardRouter.delete("/:boardId", isBoardMember, isBoardAdmin, deleteBoard);

// ==========================
// CREATE INVITE LINK (MEMBERS CAN CREATE)
// ==========================
boardRouter.post("/:boardId/invite", isBoardMember, createInviteLink);

// ==========================
// MEMBER ROUTES
// ==========================
boardRouter.get("/:boardId/members", isBoardMember, getBoardMembers);
boardRouter.get("/:boardId/members/pending", isBoardMember, isBoardAdmin, getPendingMembers);

boardRouter.patch(
  "/:boardId/members/:userId/approve",
  isBoardMember,
  isBoardAdmin,
  acceptInviteRequest
);

boardRouter.delete(
  "/:boardId/members/:userId/reject",
  isBoardMember,
  isBoardAdmin,
  rejectInviteRequest
);

boardRouter.delete(
  "/:boardId/members/:userId",
  isBoardMember,
  isBoardAdmin,
  removeBoardMember
);

boardRouter.delete("/:boardId/leave", isBoardMember, leaveBoard);

boardRouter.patch(
  "/:boardId/members/:userId/make-admin",
  isBoardMember,
  isBoardAdmin,
  makeBoardAdmin
);

// ==========================
// NESTED ROUTERS (LISTS & CHAT)
// ==========================
boardRouter.use("/:boardId/lists", isBoardMember, listRouter);
boardRouter.use("/:boardId/chat", isBoardMember, chatRouter);

module.exports = boardRouter;