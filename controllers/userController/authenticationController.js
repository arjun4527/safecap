const User=require("../../models/user-model")
const bcrypt=require("bcrypt")
const nodemailer=require("nodemailer")
const crypto=require("crypto")
const  Brands=require("../../models/brand-model")
const Products = require("../../models/product-model")
// const { addProduct } = require("./adminController")
const  Category=require("../../models/category-model")




//for password hashing
const securePassword=async(password)=>{
  try{
    const passwordHash=await bcrypt.hash(password,10)
    return passwordHash
  }catch(error){
    console.log(error.message)
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
        text:`your otp is ${otp} and it will expire in in one minute from SafeCap` 
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

    // console.log("meeeeeeee",req);
    
    console.log("shoo",req.session.customerData)
    const newOtp=crypto.randomInt(100000,999999).toString()
    // console.log(newOtp)
    req.session.otp = newOtp
    req.session.otpExpiry=Date.now()+60000

    console.log("ksdjhfsdkjfh",newOtp);
    

    const mailDetails={
      from:'mohandasarjun27@gmail.com',
      to:req.session.customerData.email,
      subject:'otp for verification',
      text:`your otp is ${newOtp} and it will expire in in one minute from SafeCap` 
     }
    
     await transporter.sendMail(mailDetails)

    return res.status(200).json({message:"OTP Resent Successfully",otp:newOtp})

  }catch(error){
    console.error("Error resending Otp:",error.message)
   return res.status(500).json({message:"Error Resending OTP"})
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
// const userLogout= async(req,res)=>{
//   try{
//       req.session.destroy()
//       return res.redirect("/login")
//   }catch(error){
//     console.log(error.message)
//   }
// }

const userLogout = async (req,res) =>{

  try {
      
      req.session.destroy(err =>{
          if(err){

              console.log(`failed to destroy session`,err.message);

              return res.status(500).send('failed to logout')
          }

          return res.redirect("/login")

      })


  } catch (error) {
      
      console.log(`error while logging out`,error.message);


  }

}


//for load forgot password
const loadForgotPassword=async(req,res)=>{
  try {

    const showMessage=req.session.sentLink || req.session.noUserFound || req.session.googleId

    req.session.sentLink=null
    req.session.noUserFound=null
    req.session.googleId=null
    return res.render("forgotPassword",{showMessage})
  } catch (error) {
    
  }
}




//forgot password
const forgotPassword=async(req,res)=>{
  try {
    const {email}=req.body
    
    const userEmail=email

    req.session.email = email
    const userData=await User.findOne({email:userEmail})

    if(!userData){
      req.session.noUserFound="No User Found With that Email"
      return res.redirect("/register")
      // return res.status(200).json({success:true,message:})
    }
    if(userData.googleId){
      req.session.googleId="Try With Google Signup"
      return res.redirect("/login")
      // return res.status(200).json({success:true,message:})
    }

    const token=crypto.randomBytes(32).toString("hex")

    const hashedToken=crypto.createHash('sha256').update(token).digest('hex')

    req.session.token=hashedToken

    const tokenExpires=Date.now()+1200000

    userData.resetPasswordToken = hashedToken

    userData.resetPasswordExpires=tokenExpires

    await userData.save()

    const resetLink=`http://localhost:8000/resetPassword/${hashedToken}`

    const transporter=nodemailer.createTransport({
      service:"gmail",
      auth:{
        user:'mohandasarjun27@gmail.com',
        pass:'ylqf efxg yydc ovre'
    
      }
    
    })

    const mailDetails={
      from:'mohandasarjun27@gmail.com',
      to:email,
      subject:'Reset Password',
      text:`Please reset your password using this link:${resetLink}. link will expires in 20 minutes.,from SafeCap` 
     }
    
     await transporter.sendMail(mailDetails)

    req.session.sentLink="Link has been sent. Please check your email."
    return res.redirect("/forgotPassword")
    //  return res.status(400).json({  success:true});


  } catch (error) {
    console.log("error from forgor password",error.message)
  }
}




const loadResetPassword = async (req, res) => {
  const token = req.session.token;

  // Check if token is available
  if (!token) {
    req.session.invalidToken = "No token provided. Please request a new password reset.";
    return res.redirect("/forgotPassword");
  }

  try {
    const errorMessage = req.session.noUser || req.session.tokenExpires || req.session.invalidToken || req.session.successMessage;

    // Clear session messages
    req.session.noUser = null;
    req.session.tokenExpires = null;
    req.session.invalidToken = null;
    req.session.successMessage = null;

    return res.render("resetPassword", { token, errorMessage });
  } catch (error) {
    console.error("Error from loadResetPassword:", error.message);
    return res.status(500).send("Internal Server Error");
  }
};

// For Reset Password
const resetPassword = async (req, res) => {
  const { token, confirmPassword } = req.body;
  

  try {
    // Check if the token is provided
    if (!token) {
      console.log("erro-1")
      req.session.invalidToken = "No token provided. Please request a new password reset.";
      return res.redirect("/forgotPassword");
    }

    
    const userData = await User.findOne({ email:req.session.email  });

    // console.log("userdata",userData.firstName,userData.lastName);
    
    if (!userData) {
      req.session.noUser = "User not found";
      console.log("erro-2")

      return res.redirect("/login");
    }

    // Check if the token has expired
    // Check if the token has expired
// if (userData.resetPasswordExpires < Date.now()) {  // Compare timestamps directly
//   req.session.tokenExpires = "The token has expired. Try again.";
//   console.log("erro-3");
//   console.log("Current time:", Date.now());
//   console.log("Token expiration time:", userData.resetPasswordExpires);
  
//   return res.redirect("/login");
// }

    // Validate token
    // if (!bcrypt.compare(token,userData.resetPasswordToken)) {

    //   console.log("erro-4")

    //   req.session.invalidToken = "Invalid or expired token. Try again.";
    //   return res.redirect("/login");
    // }

    // Hash new password
    const hashedPassword = await bcrypt.hash(confirmPassword, 10);

    console.log("hashe done",hashedPassword);
    
    // Update user data
    userData.password = hashedPassword;
    userData.resetPasswordExpires = undefined;
    userData.resetPasswordToken = undefined;

    const data = await userData.save();
    // console.log("reste expirye after save",data.resetPasswordExpires);
    // console.log("reste token after save",data.resetPasswordToken);
   
    // console.log("saved data",data);
    
    req.session.successMessage = 'Password has been reset successfully.';
    console.log("success")
    

    return res.redirect("/login");
  } catch (error) {
    console.error("Error from resetPassword:", error.message);
    return res.status(500).send("Internal Server Error");
  }
};





module.exports={
  loadRegister,
  userRegister,
  loadOtp,
  verifyOtp,
  loadLogin,
  otpResend,
  userLogin,
  userLogout,
  loadForgotPassword,
  forgotPassword,
  loadResetPassword,
  resetPassword
  

}