const express = require("express")
const listRouter = express.Router({ mergeParams: true })

const {
  createList,
  getLists,
  renameList,
  reorderLists,
  deleteLists
} = require("../Controllers/List.controller")

const  restrictToLoggedinUserOnly = require("../Middlewares/AuthZ.middleware")
const  isBoardMember  = require("../Middlewares/isBoardMember.middleware")
const isBoardAdmin = require("../Middlewares/isBoardAdmin.middleware")

const taskRouter = require("./Task.route")


listRouter.post("/", restrictToLoggedinUserOnly, isBoardAdmin, createList)
listRouter.get("/", restrictToLoggedinUserOnly, isBoardMember, getLists)
listRouter.patch("/reorder", restrictToLoggedinUserOnly, isBoardAdmin, reorderLists)
listRouter.patch("/:listId", restrictToLoggedinUserOnly, isBoardAdmin, renameList)
listRouter.delete("/:listId", restrictToLoggedinUserOnly, isBoardAdmin, deleteLists)



listRouter.use(
  "/:listId/tasks", 
  restrictToLoggedinUserOnly,
  isBoardMember,
  taskRouter
)

module.exports = listRouter
