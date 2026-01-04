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

const renameList = async (req,res)=> {
  try {
    const {listId} = req.params
    let {name} = req.body
    const boardId = req.membership.boardId
    
    if(!name || !name.trim()) return res.status(400).json({"msg" : "Please enter the new list name"})
    
      name = name.trim()

    const updatedList = await List.findOneAndUpdate(
      {_id : listId,boardId},
      {name},
      {new : true}
    )

    if(!updatedList) return res.status(404).json({"msg" : "List not found!"})
    
    return res.status(200).json({
      msg: "List renamed successfully",
      list: {
        _id: updatedList._id,
        name: updatedList.name,
      }
    })
  }
  catch(err) {
    console.log(err)
    return res.status(500).json({"msg" : "Failed to rename the list!!"})
  }
}

const reorderLists = async (req, res) => {
  try {
    const { orderedListIds } = req.body;
    const boardId = req.membership.boardId;

    if (!Array.isArray(orderedListIds) || orderedListIds.length === 0) {
      return res.status(400).json({ msg: "orderedListIds must be a non-empty array" });
    }

  
    const count = await List.countDocuments({
      _id: { $in: orderedListIds },
      boardId
    });

    if (count !== orderedListIds.length) {
      return res.status(400).json({ msg: "Invalid list reorder data" });
    }

    
    const bulkOps = orderedListIds.map((listId, index) => ({
      updateOne: {
        filter: { _id: listId, boardId },
        update: { position: index + 1 }
      }
    }));

    await List.bulkWrite(bulkOps);

    return res.status(200).json({
      msg: "Lists reordered successfully"
    })
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Failed to reorder lists" });
  }
};


module.exports = { createList,getLists,renameList,reorderLists }


