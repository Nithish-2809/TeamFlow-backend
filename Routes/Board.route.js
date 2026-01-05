const express = require("express");

const {
  createBoard,
  myBoards,
  getBoardById,
  renameBoard
} = require("../Controllers/Board.controller");

const {
  acceptInviteRequest,
  rejectInviteRequest,
  removeBoardMember,
  leaveBoard
} = require("../Controllers/BoardMembership.controller");

const restrictToLoggedinUserOnly = require("../Middlewares/AuthZ.middleware");
const isBoardMember = require("../Middlewares/isBoardMember.middleware");
const isBoardAdmin = require("../Middlewares/isBoardAdmin.middleware");

const listRouter = require("./List.route");
const inviteRouter = require("./Invite.route");

const boardRouter = express.Router();


// ==========================
// GLOBAL BOARD ROUTES
// ==========================
boardRouter.use(restrictToLoggedinUserOnly);

boardRouter.post("/create", createBoard);
boardRouter.get("/", myBoards);


// ==========================
// BOARD-SCOPED ROUTES
// ==========================
boardRouter.use("/:boardId", isBoardMember);

boardRouter.get("/:boardId", getBoardById);
boardRouter.patch("/:boardId", isBoardAdmin, renameBoard);


// ==========================
// LIST ROUTES
// ==========================
boardRouter.use("/:boardId/lists", listRouter);


// ==========================
// INVITE ROUTES
// ==========================
boardRouter.use("/:boardId/invite", inviteRouter);


// ==========================
// MEMBER MANAGEMENT (ADMIN)
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
)

boardRouter.delete(
  "/:boardId/leave",
  leaveBoard
)

module.exports = boardRouter;


