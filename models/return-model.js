const mongoose=require("mongoose")

const returnSchema=new mongoose.Schema({
  orderId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Orders"
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  productId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"AddProducts"
  },
  size:{
    type:String,
    default:"h"
  },
  returnStatus:{
    type:String,
    enum:["return requested","return approved","return rejected"],
    default:"return requested"
  },
  returnProductAmount:{
    type:Number,
    default:0
  },
  returnDate:{
    type:Date,
    default:Date.now
  },
  returnReason:{
    type:String
  }
  
})
module.exports = mongoose.model("Return", returnSchema);
