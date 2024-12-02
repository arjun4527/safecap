const Orders=require("../../models/order-model") 
const AddProducts = require("../../models/product-model")
const  Category=require("../../models/category-model")
const  Brands=require("../../models/brand-model")





//for best sellin product
const bestSellingProduct=async(req,res)=>{
  try {

    const bestSellingProduct = await Orders.aggregate([
      { $unwind: "$items" },
      {
          $group: {
              _id: "$items.product",
              totalQuantity: { $sum: "$items.quantity" }
          }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
 
]);     

const productIds = bestSellingProduct.map(product => product._id);


const productDetails = await AddProducts.find({ _id: { $in: productIds } });


const enrichedProducts = bestSellingProduct.map(product => {
  const details = productDetails.find(p => p._id.toString() === product._id.toString());
  return {
    _id: product._id,
    totalQuantity: product.totalQuantity,
    name: details?.productName || "Unknown Product",
    
    image: details?.productImage [0] || "default_image.jpg"
  };
});

 
    return res.render('bestSellingProduct',{enrichedProducts})
  } catch (error) {
    console.log("Errro from best selling product",error.message)
  }
}




//for best selling category
const bestSellingCategory=async(req,res)=>{
  try {

    const bestSellingCategory = await Orders.aggregate([
      { $unwind: "$items" },
      {
          $group: {
              _id: "$items.category",
              totalQuantity: { $sum: "$items.quantity" }
          }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
 
]);     
console.log("category",bestSellingCategory)

const categoryIds = bestSellingCategory.map(category => category._id);


const categoryDetails = await Category.find({ _id: { $in: categoryIds } });




const enrichedCategory = bestSellingCategory.map(category => {
  const details = categoryDetails.find(c => c._id.toString() === category._id.toString());
  return {
    _id: category._id,
    totalQuantity: category.totalQuantity,
    name: details?.name || "Unknown Product",
    
    
  };
});

    return res.render('bestSellingCategory',{enrichedCategory})
  } catch (error) {
    console.log("Errro from best selling category",error.message)
  }
}




//for best selling Brand
const bestSellingBrand=async(req,res)=>{
  try {

    const bestSellingBrand = await Orders.aggregate([
      { $unwind: "$items" },
      {
          $group: {
              _id: "$items.brand",
              totalQuantity: { $sum: "$items.quantity" }
          }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
 
]);     
console.log("category",bestSellingBrand)

const brandIds = bestSellingBrand.map(brand => brand._id);
console.log("idsss",brandIds)


const brandDetails = await Brands.find({ _id: { $in: brandIds } });
console.log("details",brandDetails)




const enrichedBrand = bestSellingBrand.map(brand => {
  const details = brandDetails.find(b => b._id.toString() === brand._id.toString());
  return {
    _id: brand._id,
    totalQuantity: brand.totalQuantity,
    name: details?.name || "Unknown Product",
    image:details?.image
    
    
  };
});

    return res.render('bestSellingBrand',{enrichedBrand})
  } catch (error) {
    console.log("Errro from best selling Brand",error.message)
  }
}



module.exports={
  bestSellingProduct,
  bestSellingCategory,
  bestSellingBrand
}