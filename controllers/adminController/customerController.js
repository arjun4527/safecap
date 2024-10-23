const User=require("../../models/user-model")
const bcrypt=require("bcrypt")
const Categories=require("../../models/category-model")
const Brands=require("../../models/brand-model")
const AddProducts = require("../../models/product-model")
const path=require('path')
const { log } = require("console")
const sharp = require('sharp');



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
    console.lod(error.message)
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
  
    return res.status(200).json({
       success:true,
       messsage:"Customer status updated successfully",
       user:user
    })


  } catch (error) {
     return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}





module.exports={
  customerList,
  customerStatus,
}