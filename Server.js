require("dotenv").config()
const express = require("express")
const app = express()
const ConnectToDataBase = require("./db/Connect")
ConnectToDataBase();
const port = process.env.PORT || 5000

app.get('/',(req,res)=> {
    console.log("Simple sever🥳")
})


app.listen(port,()=>console.log(`Server running on port ${port}`) )

