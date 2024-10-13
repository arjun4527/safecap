require("dotenv").config()
const connectDB=require("./config/dataBaseConfig")
const express=require("express")
const app=express()
const nocache=require("nocache")
const passport=require("./config/passport")
// app.use(nocache())

//connecting to mongoDB
connectDB()

app.use(express.static('public'))
// app.use(express.static('public/assets'));
// app.use(express.static('public/adminAssets'));

//for users routes
const userRoute = require("./routes/userRoute")
app.use("/",userRoute)


//for users routes
const adminRoute=require("./routes/adminRoute")
app.use("/admin",adminRoute)


//passport 
app.use(passport.initialize())
app.use(passport.session())




//connecting port
const PORT=process.env.PORT
app.listen(PORT,()=>{

  console.log("server is running")

})