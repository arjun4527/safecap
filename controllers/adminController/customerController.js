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
  
    const orderData=await Orders.find().skip(skip).limit(limit)

    const totalOrders=await Orders.countDocuments()

    const totalPages=Math.ceil(totalOrders/limit)

  
    
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
        
          orderStatus:orderStatus,
          updateDate: new Date()
        }
      },
      {new:true}

    )
    updatedOrder.items.forEach(item=>{
      if(item.orderStatus!=="canceled")
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
    console.log("swathy",returnData)
         
      
  
    return res.render("returnOrderList",{returnData})
  } catch (error) {
    console.log("Error from loadReturnOrderList",error.message)
  }
}




//for return accept
const returnAccept=async(req,res)=>{
  try {

    
    const {orderId,userId,productId,size}=req.body
  
    
    let refundAmount
    
    const orderData = await Orders.findById(orderId)
    const totalAmount=orderData.grandTotal

     orderData.items.forEach((i)=>{

        if(i.product.toString()=== productId.toString()&& i.size===size) {

            i.orderStatus = "return approved"
            refundAmount=Math.ceil((i.price*i.quantity)+orderData.taxPrice)
            orderData.grandTotal=Math.ceil(totalAmount-refundAmount)
            
        }
     })
     await orderData.save()

    
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
  
    const returnData = await Return.findOne({ productId: productId, size: size });
    
    returnData.returnStatus="return approved"
    
    await returnData.save()


    if(orderData.items.every(item=> item.orderStatus==='return approved'||item.orderStatus==='canceled' ||item.orderStatus==='return rejected' )){

      orderData.orderStatus="return"
    }
    await orderData.save()
  


    return res.status(StatusCodes.OK).json({success:true,message:"Return Approved SuccessFully"})


    
    
  } catch (error) {
    console.log("Error from returnAccept",error.message)
  }
}




//for return reject
const returnReject=async(req,res)=>{
  try {
    const {orderId,productId,size}=req.body
    console.log("orderId",orderId)
    
    const orderData = await Orders.findById(orderId)

     orderData.items.forEach((i)=>{

        if(i.product.toString()=== productId.toString()&& i.size===size) {

            i.orderStatus = "return rejected"
            
            
        }
     })
     await orderData.save()

     const returnData = await Return.findOne({ productId: productId, size: size });

    returnData.returnStatus="return rejected"

    await returnData.save()
    console.log("amullll",returnData)

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