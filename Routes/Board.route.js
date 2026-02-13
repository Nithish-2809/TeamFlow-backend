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

const listRouter = require("./List.route")
const inviteRouter = require("./Invite.route")
const chatRouter = require("./Chat.route")
const boardRouter = express.Router();

// ==========================
// GLOBAL BOARD ROUTES
// APPLY AUTH TO ALL ROUTES
// ==========================
boardRouter.use(restrictToLoggedinUserOnly);

// ==========================
// GLOBAL BOARD ROUTES (NO BOARD ID)
// ==========================
boardRouter.post("/create", createBoard);
boardRouter.get("/", myBoards);
boardRouter.get("/pending-boards",pendingBoards)

boardRouter.get("/pending-boards", pendingBoards);

// ==========================
// INVITE ROUTES (PUBLIC FOR NON-MEMBERS)
// PUBLIC INVITE ROUTES (NO MEMBERSHIP REQUIRED)
// These must be BEFORE the /:boardId routes
// ==========================
boardRouter.use("/:boardId/invite", inviteRouter);

boardRouter.get("/invite/:token", validateInvite);
boardRouter.post("/invite/:token/join", joinViaLink);

// ==========================
// BOARD-SCOPED ROUTES (MEMBERS ONLY)
// BOARD DETAILS (MEMBERS ONLY)
// ==========================
boardRouter.use("/:boardId", isBoardMember);

boardRouter.get("/:boardId", getBoardById);
boardRouter.patch("/:boardId", isBoardAdmin, renameBoard);
boardRouter.delete("/:boardId", isBoardAdmin, deleteBoard);

boardRouter.get("/:boardId", isBoardMember, getBoardById);

// ==========================
// LIST ROUTES
// BOARD MANAGEMENT (ADMIN ONLY)
// ==========================
boardRouter.use("/:boardId/lists", listRouter);
boardRouter.patch("/:boardId/rename", isBoardMember, isBoardAdmin, renameBoard);
boardRouter.delete("/:boardId", isBoardMember, isBoardAdmin, deleteBoard);

// ==========================
// CREATE INVITE LINK (MEMBERS CAN CREATE)
// ==========================
boardRouter.post("/:boardId/invite", isBoardMember, createInviteLink);

// ==========================
// MEMBER MANAGEMENT
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

boardRouter.delete("/:boardId/leave", leaveBoard);
boardRouter.delete("/:boardId/leave", isBoardMember, leaveBoard);

boardRouter.patch(
  "/:boardId/members/:userId/make-admin",
  isBoardMember,
  isBoardAdmin,
  makeBoardAdmin
);

boardRouter.get("/:boardId/members", getBoardMembers);

boardRouter.get(
  "/:boardId/members/pending",
  isBoardAdmin,
  getPendingMembers
);


// ==========================
// CHAT (MEMBERS ONLY)
// NESTED ROUTERS (LISTS & CHAT)
// ==========================
boardRouter.use("/:boardId/chat", chatRouter);


module.exports = boardRouter;

boardRouter.use("/:boardId/lists", isBoardMember, listRouter);
boardRouter.use("/:boardId/chat", isBoardMember, chatRouter);

module.exports = boardRouter;