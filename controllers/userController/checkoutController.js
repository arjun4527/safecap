const Cart = require("../../models/cart-model")
const User=require("../../models/user-model")
const Address=require("../../models/address-model")






//for load checkout
const loadCheckout=async(req,res)=>{
  try {
    const isLogged = req.session.user || req?.session?.passport?.user

    const currentUser = req.session.user

    const cartData=await Cart.findOne({user:currentUser}).populate("items.product")
    
    const itemsWithPrices = await calculateProductPrices(cartData)

   // for Total
    let total=0
    itemsWithPrices.forEach(item=>{
       total += item.calculatedPrice
    })

    //for tax
    const tax=Math.floor(total/100*5)

    //for shipping
    const shipping=Math.floor(total/100*.5)

    //for grandTotal
    const grandTotal=Math.floor(total+tax+shipping)

    const addressData=await Address.find({user:currentUser})
    console.log('amma',addressData)

    return res.render('checkout',{isLogged,cartData,itemsWithPrices,total,tax,shipping,grandTotal,addressData})
  } catch (error) {
    console.log("Error from loadcheckout",error.message)
  }
}



async function calculateProductPrices(cart,index) {
  
  if (!cart || !cart.items || cart.items.length === 0) {
    return [];
  }
  const itemsWithCalculatedPrices = cart.items.map((item, index) => {
    item.calculatedPrice = item.price * item.quantity;
    return item; 
  });
  return itemsWithCalculatedPrices
}







module.exports={
  loadCheckout
}