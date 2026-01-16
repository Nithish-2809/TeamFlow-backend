const express = require("express");

const {
  createBoard,
  myBoards,
  getBoardById,
  renameBoard,
  deleteBoard
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

const restrictToLoggedinUserOnly = require("../Middlewares/AuthZ.middleware");
const isBoardMember = require("../Middlewares/isBoardMember.middleware");
const isBoardAdmin = require("../Middlewares/isBoardAdmin.middleware");

const listRouter = require("./List.route")
const inviteRouter = require("./Invite.route")
const chatRouter = require("./Chat.route")

const boardRouter = express.Router();

// ==========================
// GLOBAL BOARD ROUTES
// ==========================
boardRouter.use(restrictToLoggedinUserOnly);

boardRouter.post("/create", createBoard);
boardRouter.get("/", myBoards);


// ==========================
// INVITE ROUTES (PUBLIC FOR NON-MEMBERS)
// ==========================
boardRouter.use("/:boardId/invite", inviteRouter);


// ==========================
// BOARD-SCOPED ROUTES (MEMBERS ONLY)
// ==========================
boardRouter.use("/:boardId", isBoardMember);

boardRouter.get("/:boardId", getBoardById);
boardRouter.patch("/:boardId", isBoardAdmin, renameBoard);
boardRouter.delete("/:boardId", isBoardAdmin, deleteBoard);


// ==========================
// LIST ROUTES
// ==========================
boardRouter.use("/:boardId/lists", listRouter);


// ==========================
// MEMBER MANAGEMENT
// ==========================
boardRouter.patch(
  "/:boardId/members/:userId/approve",
  isBoardAdmin,
  acceptInviteRequest
);

boardRouter.delete(
  "/:boardId/members/:userId/reject",
  isBoardAdmin,
  rejectInviteRequest
);

boardRouter.delete(
  "/:boardId/members/:userId",
  isBoardAdmin,
  removeBoardMember
);

boardRouter.delete("/:boardId/leave", leaveBoard);

boardRouter.patch(
  "/:boardId/members/:userId/make-admin",
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
// ==========================
boardRouter.use("/:boardId/chat", chatRouter);


module.exports = boardRouter;


