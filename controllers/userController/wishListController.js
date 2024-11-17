const AddProducts = require("../../models/product-model")
const WishList = require("../../models/wishList-model")
const StatusCodes=require("../../config/statusCode")








//for load wishlist
const loadWishList=async(req,res)=>{
  try {

    const isLogged = req.session.user || req?.session?.passport?.user

    const currentUser=req.session.user


    const wishListData=await WishList.findOne({user:currentUser}).populate({ path: "items.product", populate: { path: "category", } })

    return res.render("wishList",{isLogged,wishListData})
  } catch (error) {
    console.log("Error from loadWishList",error.message)
  }
}




//for add wishlist
const addWishList=async(req,res)=>{
  try {
    const {productId,size,price}=req.body
  
    const currentUser=req.session.user

    const response={
      success:false,
      message:""
    }

    const currentProduct=await AddProducts.findById(productId)
    if(!currentProduct){
      response.message="Product not found"
      return res.status(StatusCodes.NOT_FOUND).json(response);
    }


    let wishList=await WishList.findOne({user:currentUser})

    if(wishList){
      let itemIndex=wishList.items.findIndex(p=>p.product.toString()===productId.toString())

      if(itemIndex > -1){
        
        const removeProduct = await WishList.updateOne({user:currentUser},{$pull: {items :{product:productId}}})
         
        if(removeProduct){
          response.success=true,
          response.message="Product removed from wishlist"
        }else{
        response.message="Something went wrong"

        }
        return res.status(StatusCodes.OK).json(response)
      }else{
        wishList.items.push({
          product:productId,
          size,
          price
        })
      }
  
      await wishList.save()
      response.success=true
      response.message= "Wishlist updated successfully"
      return res.status(StatusCodes.OK).json(response);
    }else{
      const newWishList=await WishList.create({
        user:currentUser,
        items:[{
          product:productId,
          size,
          price
        }]
      })

      await newWishList.save()
      response.success=true
      response.message= "Product added to wishlist successfully"
      return res.status(StatusCodes.CREATED).json(response);
    }

    
  } catch (error) {
    console.log("error from addwishlist",error.message)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });

  }
}




//for remove product from wishlist
const deleteProduct=async(req,res)=>{
  try {
    const {productId}=req.body
    
  const currentUser=req.session.user

  const deleteProduct = await WishList.updateOne({user:currentUser},{$pull: {items :{product:productId}}})

  return res.status(StatusCodes.OK).json({success:true,message:"Removed successfully"})
  } catch (error) {
    console.log('deleteProduct',error.message)
  }
  
  
}





//for remove all product in wishlist 
const clearWishList=async(req,res)=>{
 
  try {

    const currentUser=req.session.user

    const deleteProducts = await WishList.updateOne({user:currentUser},{$set: {items :[]}})

    return res.status(StatusCodes.OK).json({success:true,message:"Your cart is empty"})
    
  } catch (error) {
    console.log('Error from clearCart ',error.message)
  }

  
}








module.exports = {
  loadWishList,
  addWishList,
  deleteProduct,
  clearWishList
}