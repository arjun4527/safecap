const mongoose=require("mongoose")

const productOfferSchema=new mongoose .Schema({
  offerName:{
    type:String
  },
  offerDiscount:{
    type:String
  },
  
  productId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"AddProducts"
  },
})
module.exports=mongoose.model("ProductOffer",productOfferSchema)