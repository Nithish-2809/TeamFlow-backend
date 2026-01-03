const List = require("../Models/List.model")
const mongoose = require("mongoose")

const createList = async (req, res) => {
  try {
    let { name } = req.body;
    const boardId = req.membership.boardId;

    if (!name || !name.trim()) {
      return res.status(400).json({ msg: "List name is required!" });
    }

    name = name.trim();

    
    const lastList = await List.findOne({ boardId })
      .sort({ position: -1 })
      .select("position");

    const nextPosition = lastList ? lastList.position + 1 : 1;

    const newList = await List.create({
      name,
      boardId,
      position: nextPosition,
    });

    return res.status(201).json({
      msg: "List created successfully",
      list: {
        _id: newList._id,
        name: newList.name,
        position: newList.position,
      },
    })
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Failed to create the list" });
  }
}

module.exports = { createList }


