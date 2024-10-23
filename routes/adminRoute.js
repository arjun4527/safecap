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































admin_route.get('*',(req,res)=>{
  res.redirect('/admin')
})


module.exports=admin_route