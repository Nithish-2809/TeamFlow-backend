const express = require("express")
const taskRouter = express.Router({ mergeParams: true })

const { createTask,getBoardTasks } = require("../Controllers/Task.controller")


taskRouter
.post("/", createTask)
.get("/", getBoardTasks)

module.exports = taskRouter
