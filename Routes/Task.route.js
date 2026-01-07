const express = require("express")
const taskRouter = express.Router({ mergeParams: true })

const { createTask,getBoardTasks,updateTask,deleteTask } = require("../Controllers/Task.controller")


taskRouter
.post("/", createTask)
.get("/", getBoardTasks)
.patch("/:taskId",updateTask)
.delete("/:taskId",deleteTask)

module.exports = taskRouter
