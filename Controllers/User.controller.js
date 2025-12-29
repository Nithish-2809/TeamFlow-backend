require("dotenv").config()
const User = require("../Models/User.Model.js")
const bcrypt = require("bcrypt")
const uploadOnCloudinary = require("../utils/Cloudinary.js")
const jwt = require("jsonwebtoken")

const userSignup = async (req, res) => {
  try {
    const { userName, email, fullName, password } = req.body

    if (!userName || !email || !fullName || !password) {
      return res.status(400).json({
        msg: "All fields are required"
      })
    }

    const existingUser = await User.findOne({
      $or: [{ userName }, { email }]
    })

    if (existingUser) {
      return res.status(409).json({
        msg: "User already exists"
      })
    }

    
    let profilePicUrl = ""

    if (req.file) {
      const uploadedImage = await uploadOnCloudinary(req.file.buffer)
      if (!uploadedImage) {
        return res.status(500).json({
          msg: "Profile image upload failed"
        })
      }
      profilePicUrl = uploadedImage.secure_url
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      userName,
      email,
      fullName,
      password: hashedPassword,
      profilePic: profilePicUrl
    })

    const newUser = await User.findById(user._id).select("-password")

    return res.status(201).json({
      msg: "Signup successful",
      user: newUser
    })

  } catch (error) {
    console.error("Signup error:", error)
    return res.status(500).json({
      msg: "Signup failed"
    })
  }
}

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        msg: "All fields are required"
      })
    }

    const existingUser = await User.findOne({ email })

    if (!existingUser) {
      return res.status(401).json({
        msg: "Invalid email or password"
      })
    }

    const isValid = await bcrypt.compare(password, existingUser.password)

    if (!isValid) {
      return res.status(401).json({
        msg: "Invalid email or password"
      })
    }


    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    return res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        _id: existingUser._id,
        userName: existingUser.userName,
        email: existingUser.email,
        fullName: existingUser.fullName,
        profilePic: existingUser.profilePic
      }
    })

  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({
      msg: "Login failed"
    })
  }
}

module.exports = { userSignup,userLogin }
