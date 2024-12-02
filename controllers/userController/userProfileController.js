const User=require("../../models/user-model")
const bcrypt=require("bcrypt")
const Address=require("../../models/address-model")
const Orders=require("../../models/order-model")
const AddProducts = require("../../models/product-model")
const StatusCodes=require("../../config/statusCode")
const Wallet = require("../../models/wallet-model")








//for password hashing
const securePassword=async(password)=>{
  try{
    const passwordHash=await bcrypt.hash(password,10)
    return passwordHash
  }catch(error){
    console.log(error.message)
  }
}




//for load profile
const loadProfile=async(req,res)=>{
  try {
    
    const isLogged = req.session.user || req?.session?.passport?.user

    const currentUser= req.session.user || req?.session?.passport?.user

    const userData=await User.findOne({_id:currentUser})

    const userAddress=await Address.find({user:currentUser})
    


    // console.log("user",userData)

    return res.render("profile",{isLogged,userData,userAddress})

  } catch (error) {
    console.log("Error from loadProfile",error.message)
  }
}




//for loadEditProfile
const  loadEditProfile=async(req,res)=>{
  try {
    const isLogged = req.session.user || req?.session?.passport?.user

    const currentUser= req.session.user || req?.session?.passport?.user

    const userData=await User.findOne({_id:currentUser})

    console.log("user",userData)

    return res.render("editProfile",{isLogged,userData})
  } catch (error) {
    console.log("Error from loadEditProfile",error.message)
  }
}




//for edit profile
const editProfile=async(req,res)=>{
  try {
    const currentUser= req.session.user || req?.session?.passport?.user

    const {firstName,lastName,email}=req.body

  

    if(firstName || lastName){
      const updatedProfile=await User.findByIdAndUpdate(
        currentUser,
        {
          $set:{
            firstName,
            lastName,
            email
          }
        },
        {new:true}
      )
      console.log("update",updatedProfile)
      return res.status(StatusCodes.OK).json({success:true,message:"Updation Successfully Completed"})
      
    }
  } catch (error) {
    console.log("Error from editProfile",error.message)
  }
}




// for load change password
const loadChangePassword=async(req,res)=>{
  try {
    const isLogged = req.session.user || req?.session?.passport?.user

    const currentUser= req.session.user || req?.session?.passport?.user

    return res.render("changePassword",{isLogged})
  } catch (error) {
    
  }
}




//for change Password
const changePassword=async(req,res)=>{
 try {
  const {currentPassword,newPassword,confirmPassword}=req.body
  
  const currentUser= req.session.user || req?.session?.passport?.user

  const userData=await User.findOne({_id:currentUser})
  
  const isCurrentPasswordMatch=await bcrypt.compare(currentPassword,userData.password)

  if(!isCurrentPasswordMatch){
    return res.status(StatusCodes.OK).json({success:false,message:"Current Password is incorrect,Try again"})
  }else{
    const spassword=await securePassword(confirmPassword)

    const updatedPassword=await User.findByIdAndUpdate(
      currentUser,
      {
        $set:{
          password:spassword
        }
      },
      {new:true}
    )
    return res.status(StatusCodes.OK).json({success:true,message:"Updation Successfully Completed"})
  }

 } catch (error) {
  console.log("Error from changePassword",error.message)
 }
}




//for load address
const loadAddress=async(req,res)=>{
  try {
    const isLogged = req.session.user || req?.session?.passport?.user

    const currentUser= req.session.user || req?.session?.passport?.user


    const addressData=await Address.find({user:currentUser})

    return res.render("address",{isLogged,addressData})
  } catch (error) {
    
  }
}




// for load add address
const loadAddAddress=async(req,res)=>{
  try {
    const isLogged = req.session.user || req?.session?.passport?.user


    return res.render("addAddress",{isLogged})
  } catch (error) {
    
  }
}




//for add address
const addAddress=async(req,res)=>{
  try {
    const {name,phone,pincode,altPhone,address,district,state,landMark}=req.body
    
    const currentUser=req.session.user || req?.session?.passport?.user

    const newAddress=new Address({
      name,
      user:currentUser,
      phone,
      pincode,
      altPhone,
      address,
      district,
      state,
      landMark
    })

    await newAddress.save()

     res.status(StatusCodes.OK).json({success:true,message:"Address Added Successfully"})
    //  return res.redirect('/addAddress')


  } catch (error) {
    console.log("Error from addAddress",error.message)
  }
}




//for remove address
const removeAddress=async(req,res)=>{
  try {
    
    const { id } = req.body;
    
    const deleteAddress=await Address.deleteOne({_id:id})

    const response={
      success:false,
      message:"",
    }

    if (deleteAddress.deletedCount === 0) {
      response.message="Address not found"
      return res.status(StatusCodes.NOT_FOUND).json(response);
    }

    response.success=true
    response.message="Address deleted successfully"

    return res.status(StatusCodes.OK).json(response);


  } catch (error) {
    console.log("Error from removeAddress ",error.message)
  }
} 




//for load edit address
const loadEditAddress=async(req,res)=>{
 try {

  const { id } = req.query;

  const addressData=await Address.findById(id)
  
  const isLogged = req.session.user || req?.session?.passport?.user

  return res.render("editAddress",{isLogged,addressData})
 } catch (error) {
  console.log("Error from loadEditAddress",error.message)
 }
}




// for edit addres
const editAddress=async(req,res)=>{
  try {
    const {id,name,phone,pincode,altPhone,address,district,state,landMark}=req.body
    
    const updatedAddress=await Address.findByIdAndUpdate(
      id,
      {
        $set:{
          name,
          phone,
          pincode,
          altPhone,
          address,
          district,
          state,
          landMark

        }
      },
      {new:true}
    )
    return res.status(StatusCodes.OK).json({success:true,message:"Updation Successfully Completed"})
    

  } catch (error) {
    console.error("Error from editAddress",error.message)
  }
}




// for load order list
const loadOrderList=async(req,res)=>{
  try {

    const page=parseInt(req.query.page) || 1
    const limit=4
    const skip=(page-1)* limit


    // const orders=await Orders.find().skip(skip).limit(limit)
    const currentUser= req.session.user || req?.session?.passport?.user

    const orderData=await Orders.find({user:currentUser}).skip(skip).limit(limit)



    const totalOrders=await Orders.countDocuments()

    const totalPages=Math.ceil(totalOrders/limit)

    const isLogged = req.session.user || req?.session?.passport?.user

    




    return res.render("orderList",{isLogged,orderData,currentPage:page,totalPages})
  } catch (error) {
    console.log("Error from loadOrderList",error.message)
  }
}




//for load order details
const loadOrderDetails=async(req,res)=>{
  try {
    const isLogged = req.session.user || req?.session?.passport?.user

    const {id}=req.query

    const singleOrderData=await Orders.findById(id)
    

    return res.render("orderDetails",{isLogged,singleOrderData})
  } catch (error) {
    console.log("Error from loadOrderDetails",error.message)
  }
}




//for cancel product from order
const cancelProduct=async(req,res)=>{
  try {
    const currentUser = req.session.user || req?.session?.passport?.user

    const {id,orderId,size}=req.body

    let refundAmount

    const orderData=await Orders.findById(orderId)
    const totalAmount=orderData.grandTotal
    let paymentMethod=orderData.paymentMethod
    // console.log("method",paymentMethod)

    
     orderData.items.forEach((i)=>{

        if(i.product.toString()=== id.toString() && i.size===size) {

            i.orderStatus = "canceled"
            refundAmount=(i.price*i.quantity)
            orderData.grandTotal=totalAmount-refundAmount

        }
     })
     await orderData.save()

     
     for(let item of orderData.items){
      await AddProducts.updateOne(
        {_id:item.product,"variants.size":item.size},
        {$inc:{"variants.$.stock":+item.quantity}}
      )
    }
    
    //for wallet 
    if(paymentMethod!=="cashOnDelivery"){
      const walletData = await Wallet.findOne({ user: currentUser });
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
          user: currentUser,
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
    }
    

    
    

    if(orderData.items.every(item=> item.orderStatus==='canceled')){

      orderData.orderStatus="canceled"
    }
    await orderData.save()



0
     return res.status(StatusCodes.OK).json({success:true,message:"Product Canceled Successfully"})
    
  } catch (error) {
    console.log("error from cancelProduct",error.message)
  }
}




// for cancel the complete order
const orderCancel=async(req,res)=>{
  try {
    const currentUser = req.session.user; 

   const {orderId} =req.body
   
   const orderData=await Orders.findByIdAndUpdate(
    orderId,
    {
     $set:{
      orderStatus:"canceled"
     }
    }, 
    {new:true}
  )

  orderData.items.forEach(item=>{
    item.orderStatus="canceled"
  })
  await orderData.save()

const refundAmount=orderData.grandTotal

  //for wallet 
  const walletData = await Wallet.findOne({ user: currentUser });
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
      user: currentUser,
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

  return res.status(StatusCodes.OK).json({success:true,message:"Order Cancel"})


  } catch (error) {
    console.log("Error from orderCancel",error.message)
  }
}




// for orderList
const orderList=async(req,res)=>{
  try {

    const page=parseInt(req.query.page) || 1
    const limit=5
    const skip=(page-1)* limit

    const orderData=await Orders.find().skip(skip).limit(limit)

    const totalOrders=await Orders.countDocuments()

    const totalPages=Math.ceil(totalOrders/limit)
    

    return res.render('orderList',{
      orderData,
      
      currentPage:page,
      totalPages
    })
  } catch (error) {
    console.log("Error  from orderList ",error.message)
  }
}




//for load wallet 
const loadWallet=async(req,res)=>{
  try {
    const isLogged = req.session.user || req?.session?.passport?.user

    const currentUser=req.session.user

    const walletData=await Wallet.findOne({user:currentUser})

    return res.render("wallet",{isLogged,walletData})
  } catch (error) {
    console.log("Error  from loadWallet ",error.message)

  }
}




//for load invoice
const loadInvoice=async(req,res)=>{
  try {
    const {orderId}=req.query
    
    let deliveredItems
    const isLogged = req.session.user || req?.session?.passport?.user

   const orderData=await Orders.findById(orderId).populate('user')

   let totalPrice
   let subTotal=0
   let couponDiscount
   
  //  const deliveredItem = orderData.items.find(item => item.orderStatus === "delivered")
    
   orderData.items.forEach(item=>{
    if(item.orderStatus === "delivered" || item.orderStatus === "return rejected"){
      couponDiscount=item.couponDiscountAmount

      totalPrice=item.quantity*item.price
      subTotal=subTotal+totalPrice
      
    }
   })
   
   couponDiscount=orderData.couponDiscountAmount

   let taxPrice=Math.ceil(subTotal*(5/100))

   let shippingPrice=Math.ceil(subTotal*(.5/100))

   let grandPrice=Math.ceil((subTotal+taxPrice+shippingPrice)-couponDiscount)

  

    return res.render("invoice",{isLogged,orderData,totalPrice,subTotal,taxPrice,shippingPrice,grandPrice})
  } catch (error) {
    console.log("Error  from loadInvoice ",error.message)

  }
}








module.exports={
  loadProfile,
  loadEditProfile,
  editProfile,
  loadChangePassword,
  changePassword,
  loadAddress,
  loadAddAddress,
  addAddress,
  removeAddress,
  loadEditAddress,
  editAddress,
  loadOrderList,
  loadOrderDetails,
  cancelProduct,
  orderCancel,
  orderList,
  loadWallet,
  loadInvoice
}