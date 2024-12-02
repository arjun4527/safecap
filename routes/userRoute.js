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
const shopPageController=require("../controllers/userController/shopPageController.js")
const wishListController=require("../controllers/userController/wishListController.js")
const razorpayController=require("../controllers/userController/razorpayController.js")
const returnController=require("../controllers/userController/returnController.js")







const auth = require("../middleWare/userAuth")

user_route.set("view engine", "ejs")
user_route.set("views", "./views/users")


// user_route.use(express.static("public/assets"))



user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({ extended: true }))





// Home 
user_route.get("/", noCacheMiddleware, auth.userBlocked, noCacheMiddleware, userController.loadHome)
user_route.get("/productDetails", auth.userBlocked, noCacheMiddleware, auth.isLogin, userController.productDetails)
user_route.post("/search", noCacheMiddleware,auth.isLogin, userController.search)
user_route.get("/showBrand", noCacheMiddleware,auth.isLogin, userController.showBrand)





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
user_route.get("/orders", noCacheMiddleware, auth.isLogin, userProfileController.loadOrderList)
user_route.get("/invoice", noCacheMiddleware, auth.isLogin, userProfileController.loadInvoice)
user_route.get("/orderDetails", noCacheMiddleware, auth.isLogin, userProfileController.loadOrderDetails)
user_route.post("/orderDetails", noCacheMiddleware, auth.isLogin, userProfileController.cancelProduct)
user_route.post("/orderCancel", noCacheMiddleware, auth.isLogin, userProfileController.orderCancel)
user_route.get("/orderList",noCacheMiddleware,auth.isLogin,userProfileController.orderList)
user_route.get("/wallet",noCacheMiddleware,auth.isLogin,userProfileController.loadWallet)





//checkout
user_route.get("/checkout", noCacheMiddleware, auth.isLogin, checkoutController.loadCheckout)
user_route.post("/checkout", noCacheMiddleware, auth.isLogin, checkoutController.placeOrder)
user_route.get("/orderConfirmation", noCacheMiddleware, auth.isLogin, checkoutController.loadOrderConfirmation)
user_route.post("/applyCoupon", noCacheMiddleware, auth.isLogin, checkoutController.applyCoupon)
user_route.delete("/removeCoupon", noCacheMiddleware, auth.isLogin, checkoutController.removeCoupon)





//forgot password
user_route.get("/forgotPassword", noCacheMiddleware, auth.isLogout, authenticationController.loadForgotPassword)
user_route.post("/forgotPassword", noCacheMiddleware, auth.isLogout, authenticationController.forgotPassword)
user_route.get("/resetPassword/:token", noCacheMiddleware, auth.isLogout, authenticationController.loadResetPassword)
user_route.post("/resetPassword", noCacheMiddleware, auth.isLogout, authenticationController.resetPassword)




//shop page
user_route.get("/shopPage", noCacheMiddleware, auth.isLogin, shopPageController.loadShopPage)
user_route.get("/quickView", noCacheMiddleware, auth.isLogin, shopPageController.loadQuickView)
// user_route.get("/cartDataGlobal", noCacheMiddleware, auth.isLogin, shopPageController.loadCartData)
user_route.post("/filter", noCacheMiddleware, auth.isLogin, shopPageController.filter)
user_route.post("/sort", noCacheMiddleware, auth.isLogin, shopPageController.sort)




//wish List
user_route.get("/wishList", noCacheMiddleware, auth.isLogin, wishListController.loadWishList)
user_route.post("/wishList", noCacheMiddleware, auth.isLogin, wishListController.addWishList)
user_route.post("/removeProductWishList", noCacheMiddleware, auth.isLogin, wishListController.deleteProduct)
user_route.get("/clearWishList", noCacheMiddleware, auth.isLogin, wishListController.clearWishList)




//razorPay
user_route.post("/verifyPayment", noCacheMiddleware, auth.isLogin, razorpayController.verifyPayment)
user_route.post("/paymentFailure", noCacheMiddleware, auth.isLogin, razorpayController.paymentFailure)
user_route.get("/displayFailure", noCacheMiddleware, auth.isLogin, razorpayController.displayFailure)





//return product
user_route.post("/returnProduct", noCacheMiddleware, auth.isLogin, returnController.returnProduct)
user_route.post("/retryPayment", noCacheMiddleware, auth.isLogin, returnController.retryPayment)















































module.exports = user_route
