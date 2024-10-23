const mongoose=require("mongoose")

const addressSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
     ref:"User"
  },
  phone:{
    type:Number,
    required:true
  },
  pincode:{
    type:Number,
    required:true
  },
  altPhone:{
    type:Number
  },
  address:{
    type:String,
    required:true
  },
  district:{
    type:String,
    required:true
  },
  state:{
    type:String,
    required:true
  },
  landMark:{
    type:String
  }


})
module.exports=mongoose.model('Address',addressSchema)