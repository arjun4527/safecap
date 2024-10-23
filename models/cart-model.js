const mongoose=require("mongoose")

const cartSchema=new mongoose.Schema({
  product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"AddProducts"
  },
  quantity:{
    type:Number,
    default:1,
    min:1,
    max:5
  },
  calculatedPrice:{

     type:Number
  },
  // offerPrice:{
  //   type:Number,
  //   default:0
  // },
  price:{
    type:Number,
    required:true
  },
  size:{
   type:String,
   required:true
  },
  isSelected:{
    type:Boolean,
    default:true
  }, _id: false,
 
})


const cartItemSchema=new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
     ref:"User"
   },
   items:[cartSchema]
})

module.exports=mongoose.model('Cart',cartItemSchema)