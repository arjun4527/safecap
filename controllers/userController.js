const User=require("../models/user-model")
const bcrypt=require("bcrypt")
const nodemailer=require("nodemailer")
const crypto=require("crypto")
const  Brands=require("../models/brand-model")
const Products = require("../models/product-model")
const { addProduct } = require("./adminController")
const  Category=require("../models/category-model")



//for password hashing
const securePassword=async(password)=>{
  try{
    const passwordHash=await bcrypt.hash(password,10)
    return passwordHash
  }catch(error){
    console.log(error.message)
  }
}

//for home page
const loadHome=async(req,res)=>{
  try{
    const brandsData=await Brands.find({}) 
    const productsData=await Products.find({}).populate("category").populate("brand")
    const categoryData=await Category.find({})


   return res.render("home",{brandsData,productsData,categoryData})
  }catch(error){
    console.log(error.message)
    res.status(500).send("Server error") 
  }
}


//for register page
const loadRegister=async(req,res)=>{
  try{

     const emailExitsMessage=req.session.emailExitsMessage

     req.session.emailExitsMessage=null


    return res.render("register",{emailExitsMessage})
  }catch(error){
    console.log(error.message)
  }
}

// nodemailer for send mail
const transporter=nodemailer.createTransport({
  service:"gmail",
  auth:{
    user:'mohandasarjun27@gmail.com',
    pass:'ylqf efxg yydc ovre'

  }

})

//for add info to retgister page
const userRegister=async(req,res)=>{
  try{

    
    const {customerfirstName,customerlastName,customerEmail,confirmPassword} = req.body

   const isEmailExists=await User.findOne({email:customerEmail})
   if(isEmailExists){
    req.session.emailExitsMessage="Email already exists"
    return res.redirect('/register')
   }else{
    const spassword=await securePassword(confirmPassword)
 req.session.customerData = {
        firstName: customerfirstName,
        lastName: customerlastName,
        email: customerEmail,
        password: spassword, 
        is_admin:0
    };

    
       const otp=crypto.randomInt(100000,999999).toString()

       console.log(otp);
       

       //Store otp and expiry in session
       req.session.otp=otp
       req.session.otpExpiry=Date.now()+60000

       //send otp to the usersMail
       const mailDetails={
        from:'mohandasarjun27@gmail.com',
        to:req.body.customerEmail,
        subject:'otp for verification',
        text:`your otp is ${otp} and it will expire in in one minute from BlueSounds` 
       }

       await transporter.sendMail(mailDetails)
       return res.redirect('/otpVerify')
   }
    

  }catch(error){
    console.log(error.message)
  }
}
// render otpVerirfy page
const loadOtp=async(req,res)=>{
  try{
    return res.render("otpVerify")
  }catch(error){
    console.log(error.message)
  }
  
}
//verify otp 
const verifyOtp = async (req,res) =>{

  try {

    const sessionOtp=req.session.otp
    const otpValue=req.body.otp
    
    // console.log("Session OTP:", sessionOtp);
    // console.log("Received OTP:", otpValue);
    

    if(otpValue===sessionOtp){

    const userData=new User(req.session.customerData)

    console.log(userData);
    
    await userData.save()
      // console.log("saved")
  

    req.session.otp=null
    req.session.customerData=null
    return res.status(200).json({message:"verification successfull"})


    }else{
      return res.status(400).json({message:"Invalid Otp"})
    }
    
  } catch (error) {
    
    return res.status(500).json({message:"An error occured"})
  }


}



// resend otp

const otpResend=async(req,res)=>{
  try{
    const newOtp=crypto.randomInt(100000,999999).toString()
    // console.log(newOtp)
    req.session.otp = newOtp
    req.session.otpExpiry=Date.now()+60000


    const mailDetails={
      from:'mohandasarjun27@gmail.com',
      to:req.session.customerData.email,
      subject:'otp for verification',
      text:`your otp is ${newOtp} and it will expire in in one minute from BlueSounds` 
     }
     await transporter.sendMail(mailDetails)

    return res.status(200).json({message:"OTP Resent Successfully",otp:newOtp})
  }catch(error){
    console.error("Error resending Otp:",error.message)
    res.status(500).json({message:"Error Resending OTP"})
  }
}




//Render Login Page
const loadLogin=async(req,res)=>{
  try{

   
    const errorMessage = req.session.errorMessage || req.session.googleIdMessage || req.session.noUserMessage;

    // Reset session messages after they have been fetched
    req.session.errorMessage = null;
    req.session.googleIdMessage = null;
    req.session.noUserMessage = null;
  
    // Pass the single errorMessage variable to the view
    return res.render('login', { errorMessage })
   
    
  }catch(error){
    console.log(error.message)
    
  }
} 



// login using login form
const userLogin=async(req,res)=>{
  try {
    const {customerEmail,password} = req.body
// Find the user in the database based on email or username
  const userData=await User.findOne({email:customerEmail})

  if(!userData){
    // return res.status(400).send('User not found')
    req.session.noUserMessage='User not Found'
    return res.redirect("/login")
  }

//here check the user already logged through google account
  if(userData.googleId){
    req.session.errorMessage="you can login with your Google account"
     return res.redirect('/login')
  }

// Compare the given password with the stored hashed password
  const isMatch=await bcrypt.compare(password,userData.password)

    if(isMatch){

      req.session.user = userData._id

      return res.redirect("/")
    }else{
      req.session.errorMessage="Incorrect Password"
      return res.status(400).redirect('/login')
    }
  } catch (error) {
    res.status(500).send('server error')
  }
}







//for user logout
const userLogout= async(req,res)=>{
  try{
      req.session.destroy()
      return res.redirect("/login")
  }catch(error){
    console.log(error.message)
  }
}




//for render product detail page

const productDetails=async(req,res)=>{
  const productId = req.query.id
  

   try {

    const productData =await Products.findOne({_id:productId})
    
    const brandData =await Brands.findById({_id:productData.brand})

    const categoryData =await Category.findById({_id:productData.category})
    


    
    const relatedProduct=await Products.find({brand:productData.brand})
    
  
    res.render('productDetails',{productData,brandData,categoryData,relatedProduct:relatedProduct})
   } catch (error) {
    console.log(error.message)
   }
}







module.exports={
  loadHome,
  loadRegister,
  userRegister,
  loadOtp,
  verifyOtp,
  loadLogin,
  otpResend,
  userLogin,
  userLogout,
  productDetails
}
