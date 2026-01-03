const express = require("express");
const isBoardAdmin = require("../Middlewares/isBoardAdmin.middleware");
const { createList } = require("../Controllers/List.controller");

const listRouter = express.Router({ mergeParams: true });

listRouter
.post("/", isBoardAdmin, createList);

module.exports = listRouter;
