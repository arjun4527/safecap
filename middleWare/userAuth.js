const User = require("../models/user-model")


const isLogin=async(req,res,next)=>{
  try{
    if(req?.session?.user || req?.session?.passport?.user ){

   
      
      return next()
    }else{
     return res.redirect("/login")
    }
   
  }catch(error){
    console.log("error in login middleware",error.message)
  }
}

const isLogout=async(req,res,next)=>{
  try{
    if(req?.session?.user|| req?.session?.passport?.user ){
     
      return res.redirect("/")
    }else{
      return next()
    }
    
  }catch(error){
    console.log("error in logout middleware",error.message)
  }
}


const userBlocked=async(req,res,next)=>{

  const userId = req?.session?.user || req?.session?.passport?.user 


  
  const user = await User.findById(userId)
  try {
    if(!user){

    
      return res.redirect('/login')
    }else if(user.is_blocked){
      req.session.destroy()
      return res.redirect('/login')
    }else{
       
      next()
      return
    }
  } catch (error) {
    
    console.log("error in isblocked",error.message);
    
  }
}

module.exports={isLogin,isLogout,userBlocked}