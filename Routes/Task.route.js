const express = require("express")
const taskRouter = express.Router({ mergeParams: true })

const { createTask } = require("../Controllers/Task.controller")


taskRouter.post("/", createTask)

module.exports = taskRouter
