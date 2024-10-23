const express = require("express")
const user_route = express()
const session = require("express-session")
const config = require("../config/config")
const bodyParser = require("body-parser")
const passport = require("passport")
// const nocache=require("nocache")

const noCacheMiddleware = require("../middleWare/cacheClear")

require("dotenv").config();
user_route.use(session({
  secret: process.env.sessionSecret,
  resave: false,
  saveUninitialized: true
}))


const userController = require("../controllers/userController/userController.js")
const authenticationController = require("../controllers/userController/authenticationController.js")
const cartController = require("../controllers/userController/cartController")
const userProfileController = require("../controllers/userController/userProfileController")
const checkoutController=require("../controllers/userController/checkoutController")




const auth = require("../middleWare/userAuth")

user_route.set("view engine", "ejs")
user_route.set("views", "./views/users")


// user_route.use(express.static("public/assets"))



user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({ extended: true }))





// Home 
user_route.get("/", noCacheMiddleware, auth.userBlocked, noCacheMiddleware, userController.loadHome)
user_route.get("/productDetails", auth.userBlocked, noCacheMiddleware, auth.isLogin, userController.productDetails)



//Authentication
user_route.get("/register", noCacheMiddleware, auth.isLogout, authenticationController.loadRegister)
user_route.post("/register", noCacheMiddleware, auth.isLogout, authenticationController.userRegister)
user_route.get("/otpVerify", noCacheMiddleware, auth.isLogout, authenticationController.loadOtp)
user_route.post("/otpVerify", noCacheMiddleware, auth.isLogout, authenticationController.verifyOtp)
user_route.get("/login", noCacheMiddleware, auth.isLogout, authenticationController.loadLogin)
user_route.post("/login", noCacheMiddleware, auth.isLogout, authenticationController.userLogin)
user_route.get("/resendOtp", noCacheMiddleware, auth.isLogout, authenticationController.otpResend)
user_route.get("/logout", noCacheMiddleware, authenticationController.userLogout)



//login with google
user_route.get("/google", passport.authenticate("google", { scope: ["profile", 'email'] }))
user_route.get("/google/callback", passport.authenticate("google", { successRedirect: "/", failureRedirect: "/login" }))



//Cart
user_route.get("/cart", noCacheMiddleware,auth.isLogin,cartController.loadCart)
user_route.post("/cart", noCacheMiddleware, auth.isLogin, cartController.addCart)
user_route.post("/totalAmount", noCacheMiddleware, auth.isLogin, cartController.totalAmount)
user_route.post("/removeProduct", noCacheMiddleware, auth.isLogin, cartController.deleteProduct)
user_route.post("/clearCart", noCacheMiddleware, auth.isLogin, cartController.clearCart)



//userProfile
user_route.get("/profile", noCacheMiddleware, auth.isLogin, userProfileController.loadProfile)
user_route.get("/editProfile", noCacheMiddleware, auth.isLogin, userProfileController.loadEditProfile)
user_route.post("/editProfile", noCacheMiddleware, auth.isLogin, userProfileController.editProfile)
user_route.get("/changePassword", noCacheMiddleware, auth.isLogin, userProfileController.loadChangePassword)
user_route.post("/changePassword", noCacheMiddleware, auth.isLogin, userProfileController.changePassword)
user_route.get("/address", noCacheMiddleware, auth.isLogin, userProfileController.loadAddress)
user_route.get("/addAddress", noCacheMiddleware, auth.isLogin, userProfileController.loadAddAddress)
user_route.post("/addAddress", noCacheMiddleware, auth.isLogin, userProfileController.addAddress)
user_route.delete("/removeAddress", noCacheMiddleware, auth.isLogin, userProfileController.removeAddress)
user_route.get("/editAddress", noCacheMiddleware, auth.isLogin, userProfileController.loadEditAddress)
user_route.post("/editAddress", noCacheMiddleware, auth.isLogin, userProfileController.editAddress)




//checkout
user_route.get("/checkout", noCacheMiddleware, auth.isLogin, checkoutController.loadCheckout)






















module.exports = user_route
