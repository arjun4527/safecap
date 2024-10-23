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
  name: { 
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
  productImage:[
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
  orderStatus: {
    type: String,
    enum: ["pending", "shipped", "delivered", "canceled"],
    default: "pending",
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users", //
    required: true,
  },
  orderItems: [orderItemSchema], 
  subTotal:{
    type : Number,
    required : true,
    default : 0
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
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    pincode: { type: Number, required: true },
    address: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    landMark: { type: String },
    altPhone: { type: Number },
    
  },
  orderStatus: {
    type: String,
    enum: ["pending", "shipped", "delivered", "canceled"],
    default: "pending",
  },
  orderDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
});

module.exports = mongoose.model("Orders", orderSchema);
