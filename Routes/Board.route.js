const {createBoard,myBoards,getBoardById} = require("../Controllers/Board.controller")
const express = require("express")
const restrictToLoggedinUserOnly = require("../Middlewares/AuthZ.middleware")

const boardRouter = express.Router()

boardRouter
.post('/create',restrictToLoggedinUserOnly,createBoard)
.get('/',restrictToLoggedinUserOnly,myBoards)
.get('/:boardId',restrictToLoggedinUserOnly,isBoardMember,getBoardById)

module.exports = boardRouter

