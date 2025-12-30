const {createBoard,myBoards} = require("../Controllers/Board.controller")
const express = require("express")
const restrictToLoggedinUserOnly = require("../Middlewares/AuthZ.middleware")

const boardRouter = express.Router()

boardRouter
.post('/create',restrictToLoggedinUserOnly,createBoard)
.get('/',restrictToLoggedinUserOnly,myBoards)

module.exports = boardRouter