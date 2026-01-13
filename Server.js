require("dotenv").config()
const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const boardChatSocket = require("./Sockets/Chat.board.socket")
const personalChatSocket = require("./Sockets/Chat.dm.socket")
const messageSeenSocket = require("./Sockets/Chat.markRead.socket")
const ConnectToDataBase = require("./db/Connect")
ConnectToDataBase()

const app = express()
const port = process.env.PORT || 5000


app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


app.get("/", (req, res) => {
  res.send("simple server🥳🥳")
})

const userRouter = require("./Routes/User.route")
app.use("/api/users", userRouter)

const boardRouter = require("./Routes/Board.route")
app.use("/api/boards", boardRouter)

const inviteRoutes = require("./Routes/Invite.route")
app.use("/api/invites", inviteRoutes)

// ===================== HTTP + SOCKET =====================
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  }
})

// expose io to controllers
app.set("io", io)

// ===================== SOCKET LAYER =====================
io.on("connection", (socket) => {
  console.log("🟢 socket connected:", socket.id)

  // 🔐 register user (private room)
  socket.on("registerUser", (userId) => {
    socket.join(`user_${userId}`)
    console.log(`socket ${socket.id} joined user room user_${userId}`)
  })

  // 👥 join board (collaboration room)
  socket.on("joinBoard", (boardId) => {
    socket.join(`board_${boardId}`)
    console.log(`socket ${socket.id} joined board board_${boardId}`)
  })

  // 👋 leave board
  socket.on("leaveBoard", (boardId) => {
    socket.leave(`board_${boardId}`)
    console.log(`socket ${socket.id} left board board_${boardId}`)
  })

  boardChatSocket(io, socket)
  personalChatSocket(io, socket)
  messageSeenSocket(io,socket)

  socket.on("disconnect", () => {
    console.log("🔴 socket disconnected:", socket.id)
  })
})

// ===================== START SERVER =====================
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
})
