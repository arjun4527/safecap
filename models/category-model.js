const mongoose = require("mongoose")

const categorySchema=new mongoose.Schema({
  name:{
    type:String
  },
  description:{
    type:String
  },
  is_blocked:{
    type:Boolean,
    default:false
  }
})

module.exports=mongoose.model('Categories',categorySchema)