const mongoose=require("mongoose")

const brandSchema=new mongoose.Schema({
  name:{
    type:String
  },
  image:{
    type:String
  },
  is_blocked:{
    type:Boolean,
    default:false
  }
})
module.exports=mongoose.model("Brands",brandSchema)