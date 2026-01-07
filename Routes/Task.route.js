const express = require("express")
const taskRouter = express.Router({ mergeParams: true })

const { createTask,getBoardTasks,updateTask } = require("../Controllers/Task.controller")


taskRouter
.post("/", createTask)
.get("/", getBoardTasks)
.patch("/:taskId",updateTask)

module.exports = taskRouter
