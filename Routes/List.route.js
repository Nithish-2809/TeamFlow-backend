const express = require("express");
const isBoardAdmin = require("../Middlewares/isBoardAdmin.middleware");
const { createList,getLists,renameList,reorderLists } = require("../Controllers/List.controller");

const listRouter = express.Router({ mergeParams: true });

listRouter
.post("/", isBoardAdmin, createList)
.get("/",getLists)
.patch("/:listId",isBoardAdmin,renameList)
.patch("/reorder",isBoardAdmin,reorderLists)

module.exports = listRouter
