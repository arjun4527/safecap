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


const adminController=require("../controllers/adminController")


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


admin_route.get("/",auth.isLogout,adminController.loadLogin)
admin_route.post("/",auth.isLogout,adminController.verifyLogin)
admin_route.get("/dashboard",auth.isLogin,adminController.loadDashboard)
admin_route.get("/categories",auth.isLogin,adminController.loadCategories)
admin_route.post("/categories",auth.isLogin,adminController.addCategories)
admin_route.get("/brands",auth.isLogin,adminController.loadbrands)
admin_route.post("/brands",upload.single("brandImage"),adminController.addbrands)
admin_route.get("/addProduct",auth.isLogin,adminController.loadAddProduct)
admin_route.post("/addProduct",upload.array("image",4),adminController.addProduct)
admin_route.get("/productList",auth.isLogin,adminController.loadProductList)
admin_route.get("/productDetails",auth.isLogin,adminController.loadProductDetails)
admin_route.get("/editProduct",auth.isLogin,adminController.loadEditProduct)
admin_route.post("/removeProductImage",auth.isLogin,adminController.removeProductImage)
admin_route.post("/editProduct",upload.array("image",4),adminController.editProduct)
admin_route.post("/productStatus",auth.isLogin,adminController.productStatus)
admin_route.post("/categoryStatus",auth.isLogin,adminController.categoryStatus)
admin_route.get("/logout",adminController.adminLogout)
admin_route.get("/editBrand",upload.single("brandImage"),auth.isLogin,adminController.loadEditBrand)
admin_route.post("/editBrand",upload.single("brandImage"),auth.isLogin,adminController.editBrand)
admin_route.post("/removeBrandImage",auth.isLogin,adminController.removeBrandImage)
admin_route.get("/customerList",auth.isLogin,adminController.customerList)
admin_route.post("/customerStatus",auth.isLogin,adminController.customerStatus)
admin_route.post("/brandStatus",auth.isLogin,adminController.brandStatus)
admin_route.get("/editCategory",auth.isLogin,adminController.loadEditCategory)
admin_route.post("/editCategory",auth.isLogin,adminController.editCategory)

























admin_route.get('*',(req,res)=>{
  res.redirect('/admin')
})


module.exports=admin_route