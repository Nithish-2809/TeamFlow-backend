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
// PUBLIC ROUTES (NO AUTH REQUIRED)
// Must be before auth middleware
// ==========================
boardRouter.get("/invite/:token", validateInvite);
boardRouter.post("/invite/:token/join", restrictToLoggedinUserOnly, joinViaLink);

// ==========================
// APPLY AUTH TO ALL ROUTES BELOW
// ==========================
boardRouter.use(restrictToLoggedinUserOnly);

// ==========================
// GLOBAL BOARD ROUTES (NO BOARD ID)
// ==========================
boardRouter.post("/create", createBoard);
boardRouter.get("/", myBoards);
boardRouter.get("/pending-boards", pendingBoards);

// ==========================
// CREATE INVITE LINK (BOARD MEMBERS ONLY)
// ==========================
boardRouter.post("/:boardId/invite", isBoardMember, createInviteLink);

// ==========================
// MEMBER MANAGEMENT (BOARD SCOPED)
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

boardRouter.patch(
  "/:boardId/members/:userId/make-admin",
  isBoardMember,
  isBoardAdmin,
  makeBoardAdmin
);

boardRouter.delete("/:boardId/leave", isBoardMember, leaveBoard);

// ==========================
// NESTED ROUTERS (LISTS & CHAT)
// ==========================
boardRouter.use("/:boardId/lists", isBoardMember, listRouter);
boardRouter.use("/:boardId/chat", isBoardMember, chatRouter);

// ==========================
// BOARD CRUD (MEMBERS ONLY)
// Must be after more specific /:boardId routes
// ==========================
boardRouter.get("/:boardId", isBoardMember, getBoardById);
boardRouter.patch("/:boardId", isBoardMember, isBoardAdmin, renameBoard);
boardRouter.delete("/:boardId", isBoardMember, isBoardAdmin, deleteBoard);

module.exports = boardRouter;