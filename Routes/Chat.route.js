const express = require("express")
const chatRouter = express.Router({ mergeParams: true })

const { getChatHistory } = require("../Controllers/Chat.controller")

chatRouter.get("/", getChatHistory)

module.exports = chatRouter
