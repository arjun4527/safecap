const User=require("../../models/user-model")
const bcrypt=require("bcrypt")
const nodemailer=require("nodemailer")
const crypto=require("crypto")
const  Brands=require("../../models/brand-model")
const Products = require("../../models/product-model")
// const { addProduct } = require("./adminController")
const  Category=require("../../models/category-model")
const StatusCodes=require("../../config/statusCode")
const WishList = require("../../models/wishList-model")
const ProductOffer = require("../../models/productOffer-model")
const BrandOffer = require("../../models/brandOffer-model")
const AddProducts = require("../../models/product-model")
const  Categories=require("../../models/category-model")









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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Server error") 
  }
}







//for render product detail page

const productDetails=async(req,res)=>{
  const productId = req.query.id

   try {

    const currentUser=req.session.user

    const productData =await Products.findOne({_id:productId})
   // for offer 
    const hasOfferPrice = productData.variants.some(variant => variant.offerPrice !== undefined);

    const offerData=await ProductOffer.findOne({productId:productId})
  
    const currentProduct=await Products.findById(productId)

    const brandId=currentProduct.brandId

    const brandOfferData=await BrandOffer.findOne({brandId:brandId})
    
    const brandData =await Brands.findById({_id:productData.brand})

    const categoryData =await Category.findById({_id:productData.category})

    const isLogged=req.session.user || req?.session?.passport?.user 


    const count = await WishList.countDocuments({
      user: currentUser,
      items: { $elemMatch: { product: productId } }
    });
    
    const isWishListExist = count > 0;
    
    console.log("food",productData)

    
    const relatedProduct=await Products.find({brand:productData.brand})
    
  
    res.render('productDetails',{productData,brandData,categoryData,isLogged,relatedProduct:relatedProduct,isWishListExist,hasOfferPrice,offerData,brandOfferData})
   } catch (error) {
    console.log("erro from load product details",error.message)
   }
}




//for search
const search=async(req,res)=>{
  console.log("arjun")
  try {
    const {searchInput}=req.body


    const isLogged = req.session.user || req?.session?.passport?.user

  

    const categoryData=await Categories.find({})

    const brandData=await Brands.find({})

    
    if (!searchInput) {
      return res.status(400).json({success:false, message: 'Search input is required' });
  }
  const productData = await AddProducts.find({
    $or: [
        { productName: { $regex: searchInput, $options: 'i' } },
        { description: { $regex: searchInput, $options: 'i' } }
    ]
 });
 if (!productData) {
  return res.status(400).json({success:false, message: 'No product found' });
}else{
  console.log("shop")
  return res.render("shopPage",{productData,isLogged,categoryData,brandData})
}
  } catch (error) {
    console.log("error from load search product",error.message)

  }
}




//for show brand
const showBrand=async(req,res)=>{
  try {
    const {brandId}=req.query

    console.log("id",brandId)

    const isLogged = req.session.user || req?.session?.passport?.user

  

    const categoryData=await Categories.find({})

    const brandData=await Brands.find({})
    

    const  productData=await AddProducts.find({brand:brandId})

    // const productData=[productDatas]
    console.log("datacheck",productData)


     return res.render("shopPage",{productData,isLogged,categoryData,brandData})

  } catch (error) {
    console.log("error from load showBrand",error.message)

  }
}







module.exports={
  loadHome,
  productDetails,
  search,
  showBrand
}
