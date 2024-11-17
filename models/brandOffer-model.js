const mongoose=require("mongoose")

const brandOfferSchema=new mongoose .Schema({
  offerName:{
    type:String
  },
  offerDiscount:{
    type:String
  },
 
  brandId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Brands"
  },
})
module.exports=mongoose.model("BrandOffer",brandOfferSchema)