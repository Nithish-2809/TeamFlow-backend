const express = require("express")
const { userSignup,userLogin,forgotPassword } = require("../Controllers/User.controller")
const upload = require("../Middlewares/FileUpload.middleware")

const userRouter = express.Router()

userRouter
.post(
  "/signup",
  upload.single("profilePic"), 
  userSignup
)
.post("/login",userLogin)
.post("/forgot-password",forgotPassword)

module.exports = userRouter
