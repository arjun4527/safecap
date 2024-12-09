const Cart = require("../../models/cart-model")
const User=require("../../models/user-model")
const Address=require("../../models/address-model")
const Orders=require("../../models/order-model")
const AddProducts = require("../../models/product-model")
const StatusCodes=require("../../config/statusCode")
const Coupon=require("../../models/coupon-model")
const Razorpay=require('razorpay')
const Crypto = require('crypto');
const Wallet = require("../../models/wallet-model")

require("dotenv").config()


const razorPayKeyId= process.env.RAZORPAY_KEY_ID






//for load checkout
const loadCheckout=async(req,res)=>{
  try {
    const isLogged = req.session.user || req?.session?.passport?.user

    const currentUser = req.session.user

    const cartData=await Cart.findOne({user:currentUser}).populate("items.product")
   
    // to find particular document which the currentUser is not include in the user Array in document
    const couponData = await Coupon.find({
      user: { $nin: [currentUser] }
  });
    
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
    
    
   const couponDiscount=req.session.couponDiscount


    const totalAmount=req.session.finalAmount

   




    return res.render('checkout',{isLogged,cartData,itemsWithPrices,total,tax,shipping,grandTotal,addressData,couponData,totalAmount,couponDiscount})
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
      return res.status(StatusCodes.BAD_REQUEST).json({success:false,message:"User not found"})
    }

    const {paymentMethod,addressId}=req.body
    // console.log("hlo",paymentMethod)
    // console.log("hi",addressId)


    // const now = new Date();
    //   const currentDate=new Date(now).toLocaleDateString('en-US', {
    //     year: 'numeric',
    //     month: 'long',
    //     day: 'numeric'
    //   });

    if(!addressId){
      return res.status(StatusCodes.BAD_REQUEST).json({success:false,message:'Address Id is required'})
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

    let finalAmount

    if(req.session.finalAmount) {

        finalAmount = req.session.finalAmount
    } else {

      finalAmount = grandTotal
    }

     let couponDiscountAmount=grandTotal-finalAmount
   
    

    if(finalAmount>1000 && paymentMethod === "cashOnDelivery"){
      return res.status(200).json({success:false,message:'Cash on delivery only available for upto 1000Rs purchase'})
    }

    const productImages =  cartData.items.map((item) =>{
           
      
       return item.product.productImage
         
    })
    for (const item of cartData.items) {
      const product = await AddProducts.findById(item.product );
      
      const variant = product.variants.find(v => v.size === item.size);

      if(product.is_blocked){
        return res.status(StatusCodes.OK).json({ success: true, message: `Product is Blocked ${product.productName} (size: ${item.size})` });
      }
    
      if (variant.stock < item.quantity) {
        return res.status(StatusCodes.OK).json({ success: true, message: `Insufficient stock for ${product.productName} (size: ${item.size})` });
      }
    }
    
 

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
      grandTotal:finalAmount,
      paymentMethod:paymentMethod,
      couponDiscountAmount
      

    })

    const orderData=await order.save()

    const orderId=orderData._id

    if(paymentMethod === "wallet"){
       
      const hasWalletData=await Wallet.findOne({user:currentUser})

      if(hasWalletData){
        if(hasWalletData.balance>finalAmount){
          let newBalance=(hasWalletData.balance-finalAmount)
          const newWalletData = await Wallet.findOneAndUpdate(
            { user: currentUser }, // Filter
            { $set: { balance: newBalance } }, // Update operation
            { new: true } // Option to return the updated document
          );
          
        }else{
          return res.status(200).json({ success: false, message: "Insufficient Balance in your Wallet" });
        }
      }
    }

    if (paymentMethod === "razorPay") {
      try {
          const razorPay = new Razorpay({
              key_id: razorPayKeyId,
              key_secret: process.env.RAZORPAY_KEY_SECRET, // Correct typo
          });
  
          const options = {
              amount: finalAmount * 100, // Amount in smallest currency unit
              currency: 'INR',
              receipt: `receipt_${Math.random()}`, // Template literal for receipt
          };
  
          const order = await razorPay.orders.create(options);
  
      
          const deleteProducts = await Cart.updateOne({user:currentUser},{$set: {items :[]}})

          for(let item of cartData.items){
            await AddProducts.updateOne(
              {_id:item.product,"variants.size":item.size},
              {$inc:{"variants.$.stock":-item.quantity}}
            )
          }

          // Send response
          return res.json({ success: true, order, razorPayKeyId,orderId});
      } catch (error) {
          console.error("Error creating Razorpay order: ", error);
  
          // Send error response
          return res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
      }
  }
  


    for(let item of cartData.items){
      await AddProducts.updateOne(
        {_id:item.product,"variants.size":item.size},
        {$inc:{"variants.$.stock":-item.quantity}}
      )
    }

    const deleteProducts = await Cart.updateOne({user:currentUser},{$set: {items :[]}})

    const orderDatas=await Orders.findByIdAndUpdate(
      orderId,
      { $set: { paymentStatus: "paid" } },  
      { new: true }
    )


    const couponId=req.session.couponId
    
    const currentCoupon=await Coupon.findByIdAndUpdate(
      couponId,
      { $push: { user: currentUser } },
      { new: true }  
  );

    req.session.finalAmount = null

    req.session.couponId=null
    return res.status(StatusCodes.CREATED).json({success:true,message:"Order Confirmed"})
    
  
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




// for  apply coupon
const applyCoupon=async(req,res)=>{
  try {
    
    const currentUser = req.session.user


    const {couponId}=req.body
    
    const couponData=await Coupon.findById(couponId)

    if(couponData.is_blocked){
      return res.status(StatusCodes.OK).json({success:false,message:"This coupon is not valid"})
    }
  

    const discountPercentage=couponData.couponDiscount



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

    if(couponData.minAmount>grandTotal){
      return res.status(StatusCodes.OK).json({success:false,message:`Your total is below the minimum purchase amount of ${couponData.minAmount} required to use this coupon. Add more items to qualify!`})

    }
    let couponDiscount=(grandTotal/100)* Number(discountPercentage)

    if(couponDiscount>couponData.maxAmount){
      couponDiscount=couponData.maxAmount
    }
    const totalAmount=grandTotal-couponDiscount

    const finalAmount=Math.ceil(totalAmount)
    
    req.session.finalAmount=finalAmount

    req.session.couponId=couponId
  
    return res.status(StatusCodes.OK).json({success:true,
      couponDiscount:couponDiscount,
      finalAmount:finalAmount})
    
  } catch (error) {
    console.log("Error from apply coupon",error.message)
  }
}




//for remove coupon
const removeCoupon=async(req,res)=>{
  try {
    
  req.session.finalAmount=null

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

    return res.status(StatusCodes.OK).json({
      success:true,
      grandTotal:grandTotal
    })

  } catch (error) {
    console.log("Error from remove coupon",error.message)
  }
}








module.exports={
  loadCheckout,
  placeOrder,
  loadOrderConfirmation,
  applyCoupon,
  removeCoupon
}