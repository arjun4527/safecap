const mongoose=require("mongoose")

 const userSchema = new mongoose.Schema({
  firstName:{
    type:String,
    
  },
  lastName:{
    type:String,
   
  },
  email:{
    type:String,
  
  },
  googleId:{
    type:String,
   
  },
  
  password:{
    type:String,

  },
  is_admin:{
    type:Number,
    default:0
  },
  is_blocked:{
    type:Boolean,
    default:false
  }
})

module.exports=mongoose.model('User',userSchema)