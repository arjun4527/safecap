const AddProducts = require("../../models/product-model")
const Categories=require("../../models/category-model")
const Brands=require("../../models/brand-model")
const Cart = require("../../models/cart-model")
const StatusCodes=require("../../config/statusCode")





//for load shop page
const loadShopPage=async(req,res)=>{
  try {
    const isLogged = req.session.user || req?.session?.passport?.user

    const productData=await AddProducts.find({})

    const categoryData=await Categories.find({})

    const brandData=await Brands.find({})




    return res.render("shopPage",{isLogged,productData,categoryData,brandData})
  } catch (error) {
    console.log("Error from loadShopPage",error.message)
  }
} 




//for load quick view
const loadQuickView=async(req,res)=>{
  try {
   const {id}=req.query

   const productData=await AddProducts.findById(id)

    return res.render("quickView",{productData})
  } catch (error) {
    console.log("Error from quickView ",error.message)
  }
}





//for filter brand
const filter=async(req,res)=>{
  try {
    
    const selectedValueArr=req.body.selectedValueArr
  
    
    const productData=await AddProducts.find({$or:[
      {brand:selectedValueArr},
      {category:selectedValueArr}
      ]
     })
    

    return res.json({productData:productData,success:true})


  } catch (error) {
    console.log("Error from brandFilter",error.message)
  }
}





// for sorting
const sort=async(req,res)=>{
  try {
    const {sortBy}=req.body
    
    console.log(sortBy)
    let sortedProducts
    if(sortBy==="A-Z"){
     sortedProducts=await AddProducts.find().sort({ productName: 1 });

    }else if(sortBy==="Z-A"){
      sortedProducts=await AddProducts.find().sort({ productName: -1 });

    }else if(sortBy==="low to high"){
       sortedProducts = await AddProducts.aggregate([
        { $unwind: "$variants" }, 
        { $match: { "variants.size": "small" } }, 
        { $sort: { "variants.price": 1 } }, 
        
      ]);
      
    }else if(sortBy==="high to low"){
      sortedProducts = await AddProducts.aggregate([
        { $unwind: "$variants" }, 
        { $match: { "variants.size": "small" } }, 
        { $sort: { "variants.price": -1 } }, 
        
      ]);
    }
    
    
    
    return res.json({sortedProducts:sortedProducts,success:true})
  } catch (error) {
    console.log("Error from sort",error.message)
  }
}






module.exports={
  loadShopPage,
  loadQuickView,
  filter,
  sort,
  
  
}