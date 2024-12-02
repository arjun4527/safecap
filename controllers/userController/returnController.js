const User=require("../../models/user-model")
const bcrypt=require("bcrypt")
const Address=require("../../models/address-model")
const Orders=require("../../models/order-model")
const AddProducts = require("../../models/product-model")
const StatusCodes=require("../../config/statusCode")
const Wallet = require("../../models/wallet-model")
const Return = require("../../models/return-model")
const Razorpay=require('razorpay')

require("dotenv").config()


const razorPayKeyId= process.env.RAZORPAY_KEY_ID







const returnProduct=async(req,res)=>{
  try {
    const currentUser=req.session.user
    
    const {productId,orderId,reason,size}=req.body
    console.log("nokku id",orderId)
    
    
    const orderData=await Orders.findById(orderId)

    let refundAmount=0
    
     orderData.items.forEach((i)=>{

        if(i.product.toString()=== productId.toString()&& i.size===size) {

            i.orderStatus = "return requested"
            refundAmount=i.price*i.quantity
            
        }
     })

     if(orderData.items.every(item=> item.orderStatus==='return approved'||item.orderStatus==='canceled' ||item.orderStatus==='return rejected' || item.orderStatus==='return requested' )){

      orderData.orderStatus="return"
    }
    
     await orderData.save()

     const newReturn= new Return({
       orderId,
       user:currentUser,
       productId,
       size,
       returnStatus:"return requested",
       returnProductAmount:refundAmount,
       returnReason:reason
     })
     await newReturn.save()
        return res.status(200).json({success:true, message: "Return requested successfully",  });


  } catch (error) {
    console.log("Error from returnProduct",error.message)
  }
}





//for retry payment
const retryPayment=async(req,res)=>{
  try {
    const {orderId,finalAmount}=req.body

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

return res.json({ success: true, order, razorPayKeyId,orderId});




  } catch (error) {
    console.error("Error creating retey payment: ", error);
  
          // Send error response
          return res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
  }
}









module.exports={

  returnProduct,
  retryPayment
}