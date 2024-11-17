const mongoose=require("mongoose")

const productSchema=new mongoose.Schema({
  productName:{
    type:String
  },
  description:{
    type:String
  },
  category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Categories",
  },
  brand:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Brands"
  },
  
  productImage:[
    {
      type:String

    }
 ],
  variants:[
    {
      size:{
        type:String
      },
      stock:{
        type:Number
      },
      price:{
        type:Number
      },
      offerPrice:{
        type:Number
      }
    
    }
  ],
  is_blocked:{
    type:Boolean,
    default:false
  }
})

module.exports=mongoose.model('AddProducts',productSchema)