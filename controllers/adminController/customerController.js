const User=require("../../models/user-model")
const bcrypt=require("bcrypt")
const Categories=require("../../models/category-model")
const Brands=require("../../models/brand-model")
const AddProducts = require("../../models/product-model")
const Orders=require("../../models/order-model")
const path=require('path')
const { log } = require("console")
const sharp = require('sharp');
const StatusCodes=require("../../config/statusCode")
const Return=require("../../models/return-model")
const Wallet=require("../../models/wallet-model")
const mongoose=require('mongoose')
const { ObjectId } = mongoose.Types;





//for render customer List
const customerList=async(req,res)=>{
  try {

    const page=parseInt(req.query.page) || 1
    const limit=4
    const skip=(page-1)* limit

    const userData=await User.find().skip(skip).limit(limit)

    const totalUsers=await User.countDocuments()

    const totalPages=Math.ceil(totalUsers/limit)
    

    return res.render('customerList',{
      userData,
      currentPage:page,
      totalPages
    })
  } catch (error) {
    console.log(error.message)
  }
}



// for customer status
const customerStatus=async(req,res)=>{
  
  try {
    const {userId} =req.body

  const newUser=await User.findById(userId)
  
 const status=!newUser.is_blocked
 
  const user=await User.findByIdAndUpdate(userId,
    {$set:{is_blocked:status}},
    {new:true}
    
  )
  
    return res.status(StatusCodes.OK).json({
       success:true,
       messsage:"Customer status updated successfully",
       user:user
    })


  } catch (error) {
     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal Server Error' });
  }
}





//for order list
const loadOrderList=async(req,res)=>{
  try {


    const page=parseInt(req.query.page) || 1
    const limit=4
    const skip=(page-1)* limit

    const currentUser=req.session.user
    // const orders=await Orders.find().skip(skip).limit(limit)

    const orderData=await Orders.find().skip(skip).limit(limit)



    const totalOrders=await Orders.countDocuments()

    const totalPages=Math.ceil(totalOrders/limit)

  // const orderData=await Orders.find({})
    
    return res.render("orderList",{orderData,totalPages,currentPage:page,}) 
  } catch (error) {
    console.log("Errro from loadOrderList",error.message)
  }
}




//fpr load order details
const loadOrderDetails=async(req,res)=>{
  try {

    const {id}=req.query
    
    const orderData = await Orders.findById(id)    

    return res.render("orderDetails",{orderData})
  } catch (error) {
    console.log("Error from loadOrderDetails",error.message)
  }
}




//for update order Status
const updateOrderStatus=async(req,res)=>{
  try {
    const {orderStatus,orderId}=req.body
    // console.log("ksdgvj",orderStatus,orderId)

    const updatedOrder=await Orders.findByIdAndUpdate(
      orderId,
      {
        $set:{
        
          orderStatus:orderStatus
        }
      },
      {new:true}

    )
    updatedOrder.items.forEach(item=>{
      item.orderStatus=orderStatus
    })
    await updatedOrder.save()

    return res.status(StatusCodes.OK).json({success:true,message:"Order Status Updated"})
    
    

  } catch (error) {
    console.log("Error from updateOrderStatus ",error.message)
  }
}




//for load return order list
const loadReturnOrderList=async(req,res)=>{
  try {

    const returnData = await Return.find({}).populate('user').populate({
      path: 'orderId',
      populate: {
        path: 'items', 
        select: 'size' 
      }
    });  
    console.log("aaa",returnData)
         
      
  
    return res.render("returnOrderList",{returnData})
  } catch (error) {
    console.log("Error from loadReturnOrderList",error.message)
  }
}




//for return accept
const returnAccept=async(req,res)=>{
  try {

    
    const {orderId,userId,productId,size}=req.body
    
    let refundAmoun
    
    const orderData = await Orders.findById(orderId)

     orderData.items.forEach((i)=>{

        if(i.product.toString()=== productId.toString()&& i.size===size) {

            i.orderStatus = "return approved"
            refundAmount=i.price*i.quantity
            
        }
     })
     await orderData.save()

     console.log("1")


     const walletData=await Wallet.findOne({user:userId})

     if (walletData) {
      walletData.balance += refundAmount;
      walletData.transactions.push({
        orderId,
        amount: refundAmount,
        type: "credit",
        transactionStatus: "refunded",
      });
      await walletData.save();
    } else {
    
      const newWallet = await Wallet.create({
        user: userId,
        balance: refundAmount,
        transactions: [
          {
            orderId,
            amount: refundAmount,
            type: "credit",
            transactionStatus: "refunded",
          },
        ],
      });
      await newWallet.save();
    }
   console.log("2")


    const returnData=await Return.findOne({orderId:orderId})

    returnData.returnStatus="return approved"

    await returnData.save()

    console.log("3")


    return res.status(StatusCodes.OK).json({success:true,message:"Return Approved SuccessFully"})


    
    
  } catch (error) {
    console.log("Error from returnAccept",error.message)
  }
}




//for return reject
const returnReject=async(req,res)=>{
  try {
    const {orderId,productId,size}=req.body
    
    const orderData = await Orders.findById(orderId)

     orderData.items.forEach((i)=>{

        if(i.product.toString()=== productId.toString()&& i.size===size) {

            i.orderStatus = "return rejected"
            
            
        }
     })
     await orderData.save()

     const returnData=await Return.findOne({orderId:orderId})

    returnData.returnStatus="return rejected"

    await returnData.save()
    console.log("swathy")

    return res.status(StatusCodes.OK).json({success:true,message:"Return Rejected SuccessFully"})


  } catch (error) {
    console.log("Error from returnReject",error.message)
  }
}
  

 




module.exports={
  customerList,
  customerStatus,
  loadOrderList,
  loadOrderDetails,
  updateOrderStatus,
  loadReturnOrderList,
  returnAccept,
  returnReject
}