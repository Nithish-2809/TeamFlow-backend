const BoardMembershipModel = require("../Models/BoardMembership.model")
const List = require("../Models/List.model")
const mongoose = require("mongoose")

const createList = async (req, res) => {
  try {
    let { name } = req.body
    const boardId = req.membership.boardId

    if (!name || !name.trim()) {
      return res.status(400).json({ msg: "List name is required!" })
    }

    name = name.trim()

    const lastList = await List.findOne({ boardId })
      .sort({ position: -1 })
      .select("position")

    const nextPosition = lastList ? lastList.position + 1 : 1

    const newList = await List.create({
      name,
      boardId,
      position: nextPosition
    })

    // 🔹 socket side-effect
    const io = req.app.get("io")

    io.to(`board_${boardId}`).emit("list:created", {
      boardId,
      list: {
        _id: newList._id,
        name: newList.name,
        position: newList.position
      }
    })

    return res.status(201).json({
      msg: "List created successfully",
      list: {
        _id: newList._id,
        name: newList.name,
        position: newList.position
      }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ msg: "Failed to create the list" })
  }
}

const getLists = async (req, res) => {
  try {
    const boardId = req.membership.boardId;

    const lists = await List.find({ boardId })
      .sort({ position: 1 });

    return res.status(200).json({
      lists
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Failed to get lists!" });
  }
}

const renameList = async (req, res) => {
  try {
    const { listId } = req.params
    let { name } = req.body
    const boardId = req.membership.boardId

    if (!name || !name.trim()) {
      return res.status(400).json({ msg: "Please enter the new list name" })
    }

    name = name.trim()

    const updatedList = await List.findOneAndUpdate(
      { _id: listId, boardId },
      { name },
      { new: true }
    )

    if (!updatedList) {
      return res.status(404).json({ msg: "List not found!" })
    }

    
    const io = req.app.get("io")

    io.to(`board_${boardId}`).emit("list:renamed", {
      boardId,
      listId: updatedList._id,
      newName: updatedList.name
    })

    return res.status(200).json({
      msg: "List renamed successfully",
      list: {
        _id: updatedList._id,
        name: updatedList.name
      }
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ msg: "Failed to rename the list!!" })
  }
}

const reorderLists = async (req, res) => {
  try {
    const { orderedListIds } = req.body
    const boardId = req.membership.boardId

    if (!Array.isArray(orderedListIds) || orderedListIds.length === 0) {
      return res.status(400).json({
        msg: "orderedListIds must be a non-empty array"
      })
    }

    // 1️⃣ Total lists in board
    const totalLists = await List.countDocuments({ boardId })

    if (totalLists !== orderedListIds.length) {
      return res.status(400).json({
        msg: "orderedListIds must include ALL lists in the board"
      })
    }

    // 2️⃣ Validate IDs belong to board
    const matchedCount = await List.countDocuments({
      _id: { $in: orderedListIds },
      boardId
    })

    if (matchedCount !== orderedListIds.length) {
      return res.status(400).json({
        msg: "Invalid list reorder data"
      })
    }

    // 3️⃣ Prevent duplicate IDs
    if (new Set(orderedListIds).size !== orderedListIds.length) {
      return res.status(400).json({
        msg: "Duplicate list IDs detected"
      })
    }

    // 4️⃣ Reorder
    const bulkOps = orderedListIds.map((listId, index) => ({
      updateOne: {
        filter: { _id: listId, boardId },
        update: { position: index + 1 }
      }
    }))

    await List.bulkWrite(bulkOps)

    const io = req.app.get("io")

    io.to(`board_${boardId}`).emit("list:reordered", {
      boardId,
      orderedListIds
    })

    return res.status(200).json({
      msg: "Lists reordered successfully"
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      msg: "Failed to reorder lists"
    })
  }
}

const deleteLists = async (req, res) => {
  try {
    const { boardId, listId } = req.params

    const listToBeDeleted = await List.findOne({
      _id: listId,
      boardId
    })

    if (!listToBeDeleted) {
      return res.status(404).json({ msg: "List not found" })
    }

    const deletedPosition = listToBeDeleted.position
    const listName = listToBeDeleted.name

    
    await List.deleteOne({ _id: listId, boardId })

    
    await List.updateMany(
      {
        boardId,
        position: { $gt: deletedPosition }
      },
      {
        $inc: { position: -1 }
      }
    )

    
    const io = req.app.get("io")
    io.to(`board_${boardId}`).emit("list:deleted", {
      boardId,
      listId,
      deletedPosition
    })

    return res.status(200).json({
      msg: "List deleted successfully",
      list_name: listName
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ msg: "Failed to delete the list" })
  }
}



module.exports = { createList,getLists,renameList,reorderLists,deleteLists }


