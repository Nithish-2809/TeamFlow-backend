require("dotenv").config()
const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const cookieParser = require("cookie-parser")

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


const server = http.createServer(app)


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  }
})


app.set("io", io)


io.on("connection", (socket) => {
    console.log("🟢 socket connected:", socket.id)

  socket.on("joinBoard", (boardId) => {
    socket.join(boardId)
  })

  socket.on("leaveBoard", (boardId) => {
    socket.leave(boardId)
  })

  socket.on("disconnect", () => {
    console.log("🔴 socket disconnected:", socket.id)
  })
})


server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
})
