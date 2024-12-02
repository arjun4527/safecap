const Razorpay = require('razorpay'); 
const Orders=require("../../models/order-model")
const Crypto = require('crypto');
require('dotenv').config();
const Cart = require("../../models/cart-model")
const AddProducts = require("../../models/product-model")





const verifyPayment = async (req, res) => {
  try {

    const currentUser=req.session.user

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature,orderId } = req.body;

      console.log("qqqqqqqqqqqqdfghdfh")

      const hmac = Crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
      const generatedSignature = hmac.digest("hex");

      if (generatedSignature === razorpay_signature) {

        const orderData=await Orders.findByIdAndUpdate(
          orderId,
          { $set: { paymentStatus: "paid" } },  
          { new: true }
        )

        const deleteProducts = await Cart.updateOne({user:currentUser},{$set: {items :[]}})

          // Payment is valid
          return res.json({ success: true, message: "Payment verified successfully" });
      } else {
          // Invalid signature
          return res.status(400).json({ success: false, message: "Invalid payment signature" });
      }
  } catch (error) {
      console.error("Error verifying payment: ", error);

      // Send error response
      return res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};




//for  payment failure
const paymentFailure=async(req,res)=>{
  try {
    const {orderId}=req.body

    const orderData=await Orders.findByIdAndUpdate(
      orderId,
      { $set: { paymentStatus: "pending" } },  
      { new: true }
    )

    const currentUser=req.session.user


    const cartData=await Cart.findOne({user:currentUser}).populate({ path: "items.product", populate: [  "category","brand", ] })


    for(let item of cartData.items){
      await AddProducts.updateOne(
        {_id:item.product,"variants.size":item.size},
        {$inc:{"variants.$.stock":+item.quantity}}
      )
    }

    return res.json({ success: true});
  } catch (error) {
    console.log("error from paymentFailure",error.mesage)
  }
}




//for display failure
const displayFailure=async(req,res)=>{
  try {
    const isLogged = req.session.user || req?.session?.passport?.user

    const latestOrder = await Orders.findOne().sort({ _id: -1 }).exec();
    
    const orderId=latestOrder._id
    const finalAmount=latestOrder.grandTotal
    console.log("mujeeb",orderId)
    console.log("niy=thin",finalAmount)

    return res.render("displayFailure",{isLogged,orderId,finalAmount})
  } catch (error) {
    console.log("error from displayFailure",error.mesage)
  }
}




module.exports={
  verifyPayment,
  paymentFailure,
  displayFailure
}