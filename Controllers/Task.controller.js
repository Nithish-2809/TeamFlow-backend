const Task = require("../Models/Task.model")
const mongoose = require("mongoose")

const createTask = async (req, res) => {
  try {
    let { title, description } = req.body
    const { listId, boardId } = req.params
    const user = req.user

    if (!title || !title.trim()) {
      return res.status(400).json({ msg: "Task title cannot be empty" })
    }

    title = title.trim()

    const lastTask = await Task.findOne({ listId })
      .sort({ position: -1 })
      .select("position")

    const nextPosition = lastTask ? lastTask.position + 1 : 1

    const newTask = await Task.create({
      title,
      description,
      boardId,
      listId,
      position: nextPosition,
      createdBy: user._id
    })
    
    const io = req.app.get("io")

    io.to(`board_${boardId}`).emit("task:created", {
        boardId,
        listId,
        task: {
            _id: newTask._id,
            title: newTask.title,
            description: newTask.description,
            status: newTask.status,
            position: newTask.position
        }
    })

    return res.status(201).json({
      msg: "A new task is created",
      task: {
        _id: newTask._id,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        listId: newTask.listId,
        position: newTask.position
      }

    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ msg: "Failed to create a task" })
  }
}


module.exports = { createTask }
