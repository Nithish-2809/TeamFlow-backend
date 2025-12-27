require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const cookieParser = require("cookie-parser")
const ConnectToDataBase = require("./db/Connect")
ConnectToDataBase();
const port = process.env.PORT || 5000


app.use(cors({
    origin : process.env.CLIENT_URL
}))

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())

app.get('/',(req,res)=> {
    res.send("simple server🥳🥳")
})


app.listen(port,()=>console.log(`Server running on port ${port}`) )

