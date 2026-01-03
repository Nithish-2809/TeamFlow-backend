const express = require("express");
const isBoardAdmin = require("../Middlewares/isBoardAdmin.middleware");
const { createList,getLists,renameList } = require("../Controllers/List.controller");

const listRouter = express.Router({ mergeParams: true });

listRouter
.post("/", isBoardAdmin, createList)
.get("/",getLists)
.patch("/:listId",isBoardAdmin,renameList)

module.exports = listRouter;
