const {createBoard,myBoards,getBoardById,renameBoard} = require("../Controllers/Board.controller")
const express = require("express")
const restrictToLoggedinUserOnly = require("../Middlewares/AuthZ.middleware")
const isBoardMember = require("../Middlewares/isBoardMember.middleware")
const boardRouter = express.Router()
const listRouter = require("./List.route")
const isBoardAdmin = require("../Middlewares/isBoardAdmin.middleware")

boardRouter
.post('/create',restrictToLoggedinUserOnly,createBoard)
.get('/',restrictToLoggedinUserOnly,myBoards)
.get('/:boardId',restrictToLoggedinUserOnly,isBoardMember,getBoardById)
.patch('/:boardId',restrictToLoggedinUserOnly,isBoardMember,isBoardAdmin,renameBoard)

boardRouter.use(
  "/:boardId/lists",
  restrictToLoggedinUserOnly,
  isBoardMember,
  listRouter
);


module.exports = boardRouter

