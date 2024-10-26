const Cart = require("../../models/cart-model")
const User=require("../../models/user-model")
const Address=require("../../models/address-model")
const Orders=require("../../models/order-model")






//for load checkout
const loadCheckout=async(req,res)=>{
  try {
    const isLogged = req.session.user || req?.session?.passport?.user

    const currentUser = req.session.user

    const cartData=await Cart.findOne({user:currentUser}).populate("items.product")
    
    const itemsWithPrices = await calculateProductPrices(cartData)

   // for Total
    let total=0
    itemsWithPrices.forEach(item=>{
       total += item.calculatedPrice
    })

    //for tax
    const tax=Math.floor(total/100*5)

    //for shipping
    const shipping=Math.floor(total/100*.5)

    //for grandTotal
    const grandTotal=Math.floor(total+tax+shipping)

    const addressData=await Address.find({user:currentUser})
    // console.log('amma',addressData)

    return res.render('checkout',{isLogged,cartData,itemsWithPrices,total,tax,shipping,grandTotal,addressData})
  } catch (error) {
    console.log("Error from loadcheckout",error.message)
  }
}



async function calculateProductPrices(cart,index) {
  
  if (!cart || !cart.items || cart.items.length === 0) {
    return [];
  }
  const itemsWithCalculatedPrices = cart.items.map((item, index) => {
    item.calculatedPrice = item.price * item.quantity;
    return item; 
  });
  return itemsWithCalculatedPrices
}





//for place order 
const placeOrder=async(req,res)=>{

  try {
    
    const currentUser=req.session.user

    if(!currentUser){
      return res.status(400).json({success:false,message:"User not found"})
    }

    const {paymentMethod,addressId}=req.body
    // console.log("hlo",paymentMethod)
    // console.log("hi",addressId)

    if(!addressId){
      return res.status(400).json({success:false,message:'Address Id is required'})
    }

    const cartData=await Cart.findOne({user:currentUser}).populate({ path: "items.product", populate: [  "category","brand", ] })

    const totalItems=cartData.items.length

    const addressData=await Address.findById(addressId)

    const itemsWithPrices = await calculateProductPrices(cartData)

   // for Total
    let total=0
    itemsWithPrices.forEach(item=>{
       total += item.calculatedPrice
    })

    //for tax
    const tax=Math.floor(total/100*5)

    //for shipping
    const shipping=Math.floor(total/100*.5)

    //for grandTotal
    const grandTotal=Math.floor(total+tax+shipping)



    // if(grandTotal>1000 && paymentMethod === "cashOnDelivery"){
    //   return res.status(400).json({success:false,message:'Cash on delivery only available for upto 1000Rs purchase'})
    // }

    const productImages = await cartData.items.map((item) =>{
         
      
       return item.product.productImage
         
    })
    
 console.log(productImages);
 

    const orderItems=cartData.items.map(item => ({
      product:item.product,
      productName:item.product.productName,
      brand:item.product.brand._id,
      brandName:item.product.brand.name,
      category:item.product.category._id,
      categoryName:item.product.category.name,
      categoryDescription:item.product.category.description,
      quantity:item.quantity,
      price:item.price,
      size:item.size,
      description :item.product.description,
      productImages:item.product.productImage.map(image=>image)
      
    }))
    // console.log("chchcha",item.product.productImage)


    const order=new Orders({
      items:orderItems,
      user:cartData.user,
      shippingAddress:{
        name:addressData.name,
        phone:addressData.phone,
        pincode:addressData.pincode,
        address:addressData.address,
        district:addressData.district,
        state:addressData.state,
        landMark:addressData.landMark,
        altPhone:addressData.altPhone
      },
      totalItems:totalItems,
      subTotal:total,
      taxPrice:tax,
      shippingPrice:shipping,
      grandTotal:grandTotal,
      paymentMethod:paymentMethod

    })

    const orderData=await order.save()


    const deleteProducts = await Cart.updateOne({user:currentUser},{$set: {items :[]}})

    
    return res.status(200).json({success:true,message:"Order Confirmed"})
    
  


   


  } catch (error) {
    
    console.log("error in the order try block", error.message);
    
  }
}




// for order confirmation
const loadOrderConfirmation=async(req,res)=>{
  try {
    const isLogged = req.session.user || req?.session?.passport?.user

    return res.render("orderConfirmation",{isLogged})
  } catch (error) {
    
  }
}








module.exports={
  loadCheckout,
  placeOrder,
  loadOrderConfirmation
}