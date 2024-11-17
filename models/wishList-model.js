const mongoose=require("mongoose")

const wishListSchema=new mongoose.Schema({
  product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"AddProducts"
  },
  price:{
    type:Number,
    required:true
  },_id:false
  
  
  
})


const wishListItemSchema=new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
     ref:"User"
   },
   items:[wishListSchema]
})

module.exports=mongoose.model('WishList',wishListItemSchema)