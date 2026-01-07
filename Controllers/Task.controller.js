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

const getBoardTasks = async (req,res) => {
    try {
        const {boardId} = req.params

        const tasks = await Task.find({
            boardId
        }).sort({ listId: 1, position: 1 })

        return res.status(200).json({
            tasks
        })
    }
    catch(err) {
        console.error(err)
        return res.status(500).json({"msg" : "Cannot fetch the tasks!"})
    }
}

const updateTask = async (req, res) => {
  try {
    const { boardId, listId, taskId } = req.params
    const { title, description, status } = req.body

    const updateData = {}

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ msg: "Title cannot be empty" })
      }
      updateData.title = title.trim()
    }

    if (description !== undefined) {
      updateData.description = description
    }

    if (status !== undefined) {
      updateData.status = status
    }

    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: taskId,
        boardId,
        listId
      },
      updateData,
      { new: true }
    )

    if (!updatedTask) {
      return res.status(404).json({ msg: "Task not found in this list" })
    }

    const io = req.app.get("io")

    io.to(`board_${boardId}`).emit("task:updated", {
        boardId,
        listId,
        task: {
            _id: updatedTask._id,
            title: updatedTask.title,
            description: updatedTask.description,
            status: updatedTask.status,
            position: updatedTask.position
        }
    })


    return res.status(200).json({
      msg: "Task updated successfully",
      task: {
        _id: updatedTask._id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        listId: updatedTask.listId,
        position: updatedTask.position
      }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ msg: "Failed to update the task" })
  }
}

const deleteTask = async (req, res) => {
  try {
    const { taskId, listId, boardId } = req.params

    const taskToBeDeleted = await Task.findOne({
      _id: taskId,
      listId,
      boardId
    }).select("title")

    if (!taskToBeDeleted) {
      return res.status(404).json({ msg: "Cannot find the task" })
    }

    const deletedTaskTitle = taskToBeDeleted.title

    await taskToBeDeleted.deleteOne()

    const io = req.app.get("io")

    io.to(`board_${boardId}`).emit("task:deleted", {
        boardId,
        listId,
        taskId,
        title: deletedTaskTitle
    })


    return res.status(200).json({
      msg: "Task deleted successfully",
      title: deletedTaskTitle
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ msg: "Failed to delete the task" })
  }
}




module.exports = { createTask,getBoardTasks,updateTask,deleteTask }
