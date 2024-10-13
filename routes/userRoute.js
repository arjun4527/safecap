const express=require("express")
const user_route=express()
const session=require("express-session")
const config=require("../config/config")
const bodyParser=require("body-parser")
const passport=require("passport")
// const nocache=require("nocache")

const noCacheMiddleware = require("../middleWare/cacheClear")

require("dotenv").config();
user_route.use(session({
  secret:process.env.sessionSecret,
  resave:false,
  saveUninitialized:true
}))


const userController=require("../controllers/userController")
const auth=require("../middleWare/userAuth")

user_route.set("view engine","ejs")
user_route.set("views","./views/users")


// user_route.use(express.static("public/assets"))



user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))






user_route.get("/",auth.userBlocked,noCacheMiddleware,userController.loadHome) 
user_route.get("/register",noCacheMiddleware,auth.isLogout,userController.loadRegister)
user_route.post("/register",noCacheMiddleware,auth.isLogout,userController.userRegister)
user_route.get("/otpVerify",noCacheMiddleware,auth.isLogout,userController.loadOtp)
user_route.post("/otpVerify",noCacheMiddleware,auth.isLogout,userController.verifyOtp)
user_route.get("/login",noCacheMiddleware,auth.isLogout,userController.loadLogin)
user_route.post("/login",noCacheMiddleware,auth.isLogout,userController.userLogin)
user_route.get("/resendOtp",noCacheMiddleware,auth.isLogout,userController.otpResend)
//login with google
user_route.get("/google",passport.authenticate("google",{scope:["profile",'email']}))
user_route.get("/google/callback",passport.authenticate("google",{successRedirect:"/",failureRedirect:"/login"}))

user_route.get("/logout",noCacheMiddleware,userController.userLogout)
user_route.get("/productDetails",auth.userBlocked,noCacheMiddleware,auth.isLogin,userController.productDetails)





module.exports=user_route
    