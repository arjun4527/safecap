const User=require("../../models/user-model")
const bcrypt=require("bcrypt")
const Categories=require("../../models/category-model")
const Brands=require("../../models/brand-model")
const AddProducts = require("../../models/product-model")
const path=require('path')
const { log } = require("console")
const sharp = require('sharp');
const StatusCodes=require("../../config/statusCode")



//for render login
const loadLogin=async(req,res)=>{
  try {

    const noEntry=req.session.notAdmin || req.session.notExists || req.session.wrongPassword || req.session.serverError

    req.session.notAdmin=null
    req.session.notExists=null
    req.session.wrongPassword=null
    req.session.serverError=null

    res.render("adminLogin",{noEntry})
  } catch (error) {
    console.log(error.message)
  }
}


//for verify login
const verifyLogin=async(req,res)=>{
  try {
    const {adminEmail,adminPassword}=req.body
    // console.log(adminEmail);
    
    const adminData=await User.findOne({email:adminEmail})

    if(!adminData){
      req.session.notExists="Check your emailID"
      return res.status(StatusCodes.BAD_REQUEST).redirect('/admin')
      
    }

    const isMatch=await bcrypt.compare(adminPassword,adminData.password)

    if(isMatch){

      req.session.admin= adminData._id
      if(adminData.is_admin===1){
        res.redirect("/admin/dashboard")
      }else{
        req.session.notAdmin="your are not admin"
        return res.status(StatusCodes.BAD_REQUEST).redirect('/admin')
      }
        
    }else{
       req.session.wrongPassword="Incorrect password"
      return res.status(StatusCodes.BAD_REQUEST).redirect('/admin')
      
    }
  } catch (error) {
    req.session.serverError="Server Error"
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).redirect('/admin')
    
  }
}


//for render Dashboard
const loadDashboard=async(req,res)=>{
  try {
    res.render("dashboard")
  } catch (error) {
    console.log(error.message)
  }
}


  //for logout

  const adminLogout= async(req,res)=>{
    try{
        req.session.destroy()
         res.redirect("/admin")
    }catch(error){
      console.log(error.message)
    }
  }



module.exports={
  loadLogin,
  verifyLogin,
  loadDashboard,
  adminLogout,
  
  
  
  
  
}