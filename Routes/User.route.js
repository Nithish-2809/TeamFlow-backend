const express = require("express")
const { userSignup,userLogin,forgotPassword,resetPassword } = require("../Controllers/User.controller")
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
.patch("/reset-password/:token",resetPassword)



module.exports = userRouter
