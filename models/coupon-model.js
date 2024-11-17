const mongoose=require("mongoose")

const couponSchema=new mongoose.Schema({
  couponName:{
    type:String,
    required:true
  },
  couponDescription:{
    type:String,
    required:false
  },
  couponCode:{
    type:String,
    required:true
  },
  couponDiscount:{
    type:String,
    required:true
  },
  is_blocked:{
    type:Boolean,
    default:false
  
  },
  maxAmount:{
    type:Number
  },
  minAmount:{
    type:Number
  },
  user:[{
   type:mongoose.Schema.Types.ObjectId,
     ref:"User"
  }]

})

module.exports=mongoose.model("Coupon",couponSchema)