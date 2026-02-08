const express = require("express")
const taskRouter = express.Router({ mergeParams: true })

const { createTask,getListTasks,updateTask,deleteTask,reorderTasks } = require("../Controllers/Task.controller")


taskRouter
.post("/", createTask)
.get("/", getListTasks)
.patch("/reorder",reorderTasks)
.patch("/:taskId",updateTask)
.delete("/:taskId",deleteTask)


module.exports = taskRouter
