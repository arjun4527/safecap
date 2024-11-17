const express=require("express")
const admin_route=express()
const session=require("express-session")
const config=require("../config/config")
const bodyParser=require("body-parser")
const multer=require("multer")
const path=require("path")
const fs=require("fs")



require("dotenv").config();
admin_route.use(session({
  secret:process.env.sessionSecret,
  resave:false,
  saveUninitialized:true,
  cookie:{secure:false}
}))


const authenticationController=require("../controllers/adminController/authenticationController")
const brandController=require("../controllers/adminController/brandController")
const categoryController=require("../controllers/adminController/categoryController")
const customerController=require("../controllers/adminController/customerController")
const productController=require("../controllers/adminController/productController")
const couponManagementController=require("../controllers/adminController/couponManagementController")
const offerController=require("../controllers/adminController/offerController")








const noCacheMiddleware = require("../middleWare/cacheClear")


admin_route.set("view engine","ejs")
admin_route.set("views","./views/admin")



admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:true}))



//check the folder exist or not ,if not exist it will create 
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};



const storage=multer.diskStorage({
  destination:function(req,file,cb){
    const uploadPath=path.join(__dirname,'../public/productImages')
    ensureDirectoryExists(uploadPath);
    cb(null,uploadPath)
  },
  filename:function(req,file,cb){
    const name=Date.now()+'-'+file.originalname
    cb(null,name)
  }
})


const upload=multer({storage:storage})


const auth=require("../middleWare/adminAuth")

//Athentication
admin_route.get("/",noCacheMiddleware,auth.isLogout,authenticationController.loadLogin)
admin_route.post("/",noCacheMiddleware,auth.isLogout,authenticationController.verifyLogin)
admin_route.get("/logout",noCacheMiddleware,authenticationController.adminLogout)
admin_route.get("/dashboard",noCacheMiddleware,auth.isLogin,authenticationController.loadDashboard)



//Categories
admin_route.get("/categories",noCacheMiddleware,auth.isLogin,categoryController.loadCategories)
admin_route.post("/categories",noCacheMiddleware,auth.isLogin,categoryController.addCategories)
admin_route.post("/categoryStatus",noCacheMiddleware,auth.isLogin,categoryController.categoryStatus)
admin_route.get("/editCategory",noCacheMiddleware,auth.isLogin,categoryController.loadEditCategory)
admin_route.post("/editCategory",noCacheMiddleware,auth.isLogin,categoryController.editCategory)


//Brands
admin_route.get("/brands",noCacheMiddleware,auth.isLogin,brandController.loadbrands)
admin_route.post("/brands",noCacheMiddleware,upload.single("brandImage"),brandController.addbrands)
admin_route.get("/editBrand",noCacheMiddleware,upload.single("brandImage"),auth.isLogin,brandController.loadEditBrand)
admin_route.post("/editBrand",noCacheMiddleware,upload.single("brandImage"),auth.isLogin,brandController.editBrand)
admin_route.post("/removeBrandImage",noCacheMiddleware,auth.isLogin,brandController.removeBrandImage)
admin_route.post("/brandStatus",noCacheMiddleware,auth.isLogin,brandController.brandStatus)



//Products
admin_route.get("/addProduct",noCacheMiddleware,auth.isLogin,productController.loadAddProduct)
admin_route.post("/addProduct",noCacheMiddleware,upload.array("image",4),productController.addProduct)
admin_route.get("/productList",noCacheMiddleware,auth.isLogin,productController.loadProductList)
admin_route.get("/productDetails",noCacheMiddleware,auth.isLogin,productController.loadProductDetails)
admin_route.get("/editProduct",noCacheMiddleware,auth.isLogin,productController.loadEditProduct)
admin_route.post("/removeProductImage",noCacheMiddleware,auth.isLogin,productController.removeProductImage)
admin_route.post("/editProduct",noCacheMiddleware,upload.array("image",4),productController.editProduct)
admin_route.post("/productStatus",noCacheMiddleware,auth.isLogin,productController.productStatus)




//Customers
admin_route.get("/customerList",noCacheMiddleware,auth.isLogin,customerController.customerList)
admin_route.post("/customerStatus",noCacheMiddleware,auth.isLogin,customerController.customerStatus)



//orders
admin_route.get("/orderList",noCacheMiddleware,auth.isLogin,customerController.loadOrderList)
admin_route.get("/orderDetails",noCacheMiddleware,auth.isLogin,customerController.loadOrderDetails)
admin_route.post("/updateOrderStatus",noCacheMiddleware,auth.isLogin,customerController.updateOrderStatus)




//coupon
admin_route.get("/coupon",noCacheMiddleware,auth.isLogin,couponManagementController.loadCouponList)
admin_route.get("/addCoupon",noCacheMiddleware,auth.isLogin,couponManagementController.loadAddCoupon)
admin_route.post("/addCoupon",noCacheMiddleware,auth.isLogin,couponManagementController.addCoupon)
admin_route.post("/couponStatus",noCacheMiddleware,auth.isLogin,couponManagementController.couponStatus)




//offer
admin_route.get("/productOffer",noCacheMiddleware,auth.isLogin,offerController.loadProductOffer)
admin_route.get("/addOffer",noCacheMiddleware,auth.isLogin,offerController.loadAddProductOffer)
admin_route.post("/addOffer",noCacheMiddleware,auth.isLogin,offerController.addProductOffer)
admin_route.delete("/deleteOffer",noCacheMiddleware,auth.isLogin,offerController.deleteOffer)
admin_route.get("/updateOffer",noCacheMiddleware,auth.isLogin,offerController.loadUpdateOffer)
admin_route.post("/editProductOffer",noCacheMiddleware,auth.isLogin,offerController.editProductOffer)
admin_route.get("/brandOffer",noCacheMiddleware,auth.isLogin,offerController.loadBrandOffer)
admin_route.get("/addBrandOffer",noCacheMiddleware,auth.isLogin,offerController.loadAddBrandOffer)
admin_route.post("/addBrandOffer",noCacheMiddleware,auth.isLogin,offerController.addBrandOffer)
admin_route.delete("/deleteBrandOffer",noCacheMiddleware,auth.isLogin,offerController.deleteBrandOffer)
admin_route.get("/updateBrandOffer",noCacheMiddleware,auth.isLogin,offerController.loadUpdateBrandOffer)
admin_route.post("/editBrandOffer",noCacheMiddleware,auth.isLogin,offerController.editBrandOffer)



















  











admin_route.get('*',(req,res)=>{
  res.redirect('/admin')
})


module.exports=admin_route