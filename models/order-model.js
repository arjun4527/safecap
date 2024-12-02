const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AddProducts", 
    required: true,
  },
  productName: { 
    type: String,
    required: true
  },
  brand: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'brand',
    required: true
  },
  brandName: { 
    type: String,
    required: true
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
    required: true
  },
  categoryName: {
    type: String,
    required: true
  },
  categoryDescription:{
    type:String,
    required:true
  },
  productImages:[
    {
      type:String

    }
 ],
 
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  description:{
    type:String
  },
  orderStatus: {
    type: String,
    enum: ["pending", "shipping", "delivered", "canceled","return requested","return approved","return rejected"],
    default: "pending",
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", //
    required: true,
  },
  items: [orderItemSchema], 
  subTotal:{
    type : Number,
    required : true,
    default : 0
  },
  taxPrice:{
    type:Number
  },
  shippingPrice:{
    type:Number
  },
  grandTotal: {
    type: Number,
    required: true,
  },
  totalItems : {
    type : Number,
    
    default : 1
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    pincode: { type: Number, required: true },
    address: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String },
    landMark: { type: String },
    altPhone: { type: Number },
    
  },
  orderStatus: {
    type: String,
    enum: ["pending", "shipping", "delivered", "canceled","return"],
    default: "pending",
  },
  orderDate: {
    type: Date,
    required: true,
    default:Date.now
  },
  updateDate: {
    type: Date,
    required: true,
    default:Date.now
  },
  couponDiscountAmount:{
    type:Number
  }
  
});

module.exports = mongoose.model("Orders", orderSchema);
