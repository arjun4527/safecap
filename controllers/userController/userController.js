const User=require("../../models/user-model")
const bcrypt=require("bcrypt")
const nodemailer=require("nodemailer")
const crypto=require("crypto")
const  Brands=require("../../models/brand-model")
const Products = require("../../models/product-model")
// const { addProduct } = require("./adminController")
const  Category=require("../../models/category-model")



//for password hashing
const securePassword=async(password)=>{
  try{
    const passwordHash=await bcrypt.hash(password,10)
    return passwordHash
  }catch(error){
    console.log(error.message)
  }
}

//for home page
const loadHome=async(req,res)=>{
  try{
    const brandsData=await Brands.find({}) 
    const productsData=await Products.find({}).populate("category").populate("brand")
    const categoryData=await Category.find({})
    const isLogged=req.session.user || req?.session?.passport?.user 
    


   return res.render("home",{brandsData,productsData,categoryData,isLogged})
  }catch(error){
    console.log(error.message)
    res.status(500).send("Server error") 
  }
}







//for render product detail page

const productDetails=async(req,res)=>{
  const productId = req.query.id
  

   try {

    const productData =await Products.findOne({_id:productId})
    
    const brandData =await Brands.findById({_id:productData.brand})

    const categoryData =await Category.findById({_id:productData.category})

    const isLogged=req.session.user || req?.session?.passport?.user 
    


    
    const relatedProduct=await Products.find({brand:productData.brand})
    
  
    res.render('productDetails',{productData,brandData,categoryData,isLogged,relatedProduct:relatedProduct})
   } catch (error) {
    console.log(error.message)
   }
}







module.exports={
  loadHome,
  
  productDetails
}
