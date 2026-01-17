const express = require("express")
const taskRouter = express.Router({ mergeParams: true })

const { createTask,getBoardTasks,updateTask,deleteTask,reorderTasks } = require("../Controllers/Task.controller")


taskRouter
.post("/", createTask)
.get("/", getBoardTasks)
.patch("/reorder",reorderTasks)
.patch("/:taskId",updateTask)
.delete("/:taskId",deleteTask)


module.exports = taskRouter
