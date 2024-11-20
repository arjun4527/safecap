const mongoose=require('mongoose')

const walletTransactionSchema=new mongoose.Schema({
  orderId:{
     type:mongoose.Schema.Types.ObjectId,
    ref:"Orders"
  },
  amount:{
    type :Number
  },
  type:{
    type:String,
    enum:['credit','debit']
  },
  date: {
    type: Date,
    default: Date.now
  },
  transactionStatus:{
    type:String,
    enum:['refunded', 'pending', 'paid'],
    default:'pending'
  }
  
}) 

const walletSchema=new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
     ref:"User"
  },
  balance:{
    type:Number,
    default:0
  },
  transactions:[walletTransactionSchema]

})
module.exports=mongoose.model('Wallet',walletSchema)
