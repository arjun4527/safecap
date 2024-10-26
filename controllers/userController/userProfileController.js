const User=require("../../models/user-model")
const bcrypt=require("bcrypt")
const Address=require("../../models/address-model")
const Orders=require("../../models/order-model")





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

    const currentUser= req.session.user

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

    const currentUser= req.session.user

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
    const currentUser= req.session.user

    const {firstName,lastName}=req.body

    console.log("check",firstName,lastName)

    if(firstName || lastName){
      const updatedProfile=await User.findByIdAndUpdate(
        currentUser,
        {
          $set:{
            firstName,
            lastName
          }
        },
        {new:true}
      )
      console.log("update",updatedProfile)
      return res.status(200).json({success:true,message:"Updation Successfully Completed"})
      
    }
  } catch (error) {
    console.log("Error from editProfile",error.message)
  }
}




// for load change password
const loadChangePassword=async(req,res)=>{
  try {
    const isLogged = req.session.user || req?.session?.passport?.user

    const currentUser= req.session.user

    return res.render("changePassword",{isLogged})
  } catch (error) {
    
  }
}




//for change Password
const changePassword=async(req,res)=>{
 try {
  const {currentPassword,newPassword,confirmPassword}=req.body
  
  const currentUser= req.session.user

  const userData=await User.findOne({_id:currentUser})
  
  const isCurrentPasswordMatch=await bcrypt.compare(currentPassword,userData.password)

  if(!isCurrentPasswordMatch){
    return res.status(200).json({success:false,message:"Current Password is incorrect,Try again"})
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
    return res.status(200).json({success:true,message:"Updation Successfully Completed"})
  }

 } catch (error) {
  console.log("Error from changePassword",error.message)
 }
}




//for load address
const loadAddress=async(req,res)=>{
  try {
    const isLogged = req.session.user || req?.session?.passport?.user

    const currentUser= req.session.user


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
    
    const currentUser=req.session.user

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

     res.status(200).json({success:true,message:"Address Added Successfully"})
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

    if (deleteAddress.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    return res.status(200).json({ success: true, message: "Address deleted successfully" });


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
    return res.status(200).json({success:true,message:"Updation Successfully Completed"})
    

  } catch (error) {
    console.error("Error from editAddress",error.message)
  }
}




// for load order list
const loadOrderList=async(req,res)=>{
  try {
    const isLogged = req.session.user || req?.session?.passport?.user

    const currentUser= req.session.user


    const orderData=await Orders.find({user:currentUser})

    return res.render("orderList",{isLogged,orderData})
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
    // console.log("uff",singleOrderData)



    return res.render("orderDetails",{isLogged,singleOrderData})
  } catch (error) {
    console.log("Error from loadOrderDetails",error.message)
  }
}




//for cancel product from order
const cancelProduct=async(req,res)=>{
  try {
    const {id,orderId}=req.body
    
    console.log("order id",id,orderId);
    
    const orderData=await Orders.findById(orderId)
    
     orderData.items.forEach((i)=>{

        if(i.product.toString()=== id.toString()) {

          if(i.orderStatus=="canceled"){
            return res.status(200).json({success:true,message:"its already canceled "})
          }

            i.orderStatus = "canceled"
        }
     })



     await orderData.save()

     return res.status(200).json({success:true,message:"Product Canceled Successfully"})
    
  } catch (error) {
    console.log("error from cancelProduct",error.message)
  }
}




// for cancel the complete order
const orderCancel=async(req,res)=>{
  try {
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


  return res.status(200).json({success:true,message:"Order Cancel"})


  } catch (error) {
    console.log("Error from orderCancel",error.message)
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
  orderCancel
}