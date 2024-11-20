const User=require("../../models/user-model")
const bcrypt=require("bcrypt")
const Address=require("../../models/address-model")
const Orders=require("../../models/order-model")
const AddProducts = require("../../models/product-model")
const StatusCodes=require("../../config/statusCode")
const Wallet = require("../../models/wallet-model")
const Return = require("../../models/return-model")






const returnProduct=async(req,res)=>{
  try {
    const currentUser=req.session.user
    
    const {productId,orderId,reason,size}=req.body
    
    const orderData=await Orders.findById(orderId)

    let refundAmount=0
    
     orderData.items.forEach((i)=>{

        if(i.product.toString()=== productId.toString()&& i.size===size) {

            i.orderStatus = "return requested"
            refundAmount=i.price*i.quantity
            
        }
     })
     await orderData.save()

     const newReturn=await Return.create({
       orderId,
       user:currentUser,
       productId,
       returnStatus:"return requested",
       returnProductAmount:refundAmount,
       returnReason:reason
     })
    //  await newReturn.save()
        return res.status(200).json({success:true, message: "Return requested successfully",  });


  } catch (error) {
    console.log("Error from returnProduct",error.message)
  }
}









module.exports={

  returnProduct,
}