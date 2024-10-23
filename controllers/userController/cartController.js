const Cart = require("../../models/cart-model")
const AddProducts = require("../../models/product-model")



const loadCart = async (req, res) => {

  try {
    const isLogged = req.session.user || req?.session?.passport?.user

    const currentUser = req.session.user

    let cart = await Cart.findOne({ user: currentUser }).populate({ path: "items.product", populate: { path: "category", } })

    const itemsWithPrices = await calculateProductPrices(cart)
    
    // for subtotal
    let subtotal=0
    itemsWithPrices.forEach(item=>{
       subtotal += item.calculatedPrice
    })

    //for tax
    const tax=Math.floor(subtotal/100*5)

    //for shipping
    const shipping=Math.floor(subtotal/100*.5)

    //for grandTotal
    const grandTotal=Math.floor(subtotal+tax+shipping)
  

    return res.render("cart", { isLogged, cart,itemsWithPrices,subtotal,tax,shipping,grandTotal })

  } catch (error) {
    console.log("loadCart in controllar", error.message)
  }
}


const addCart = async (req, res) => {
  try {
    const { productId, size, price, quantity } = req.body;
    const currentUser = req.session.user;


    const currentProduct = await AddProducts.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    
    let cart = await Cart.findOne({ user: currentUser });

    if (cart) {
    
      let itemIndex = cart.items.findIndex(p => p.product.toString() === productId.toString() && p.size === size);

      if (itemIndex > -1) {
        return res.status(200).json({success:false,message:"product already exist in your cart"})
      } else {
    
        cart.items.push({
          product: productId, 
          size,
          price,
          quantity,
        });
      }

      // Save the updated cart
      await cart.save();
      return res.status(200).json({success:true, message: "Cart updated successfully" });
    } else {
      
      const newCart = await Cart.create({
        user: currentUser,
        items: [{
          product: productId,
          quantity,
          price,
          size
        }]
      });

      await newCart.save();
      return res.status(201).json({ message: "Product added to cart successfully" });
    }

  } catch (error) {
    console.log("addCart error:", error.message);
    res.status(500).json({ message: "Something went wrong" });
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
  console.log("happy",itemsWithCalculatedPrices)
  return itemsWithCalculatedPrices
}



const totalAmount = async (req, res) => {
  try {

    const { currentQty, id,size } = req.body
    
    if(currentQty>5){
      return res.status(200).json({success:false,message:"Maximum limit is 5"})
    }
   
    const currentUser = req.session.user

    let cart = await Cart.findOne({ user: currentUser })

    const itemIndex = await cart.items.findIndex(p => p.product.toString() == id && p.size === size)
    // console.log("index",itemIndex)
    // console.log("indexcheck",cart.items[itemIndex])

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = currentQty;
    } else {
      return res.status(404).json({ message: 'Product not found in cart' });
    }
    const newCart = await cart.save();
    console.log("shokam",newCart)
    
    const itemsWithPrices = await calculateProductPrices(newCart,itemIndex);

    return res.status(200).json({success:true,itemsWithPrices:itemsWithPrices})
    
  } catch (error) {
    console.log("errror in totalAmount", error);
  }
}



//for remove product from cart
const deleteProduct=async(req,res)=>{
  try {
    const {id,size}=req.body
    
  const currentUser=req.session.user

  const deleteProduct = await Cart.updateOne({user:currentUser},{$pull: {items :{product:id,size:size}}})

  return res.status(200).json({success:true,message:"Removed successfully"})
  } catch (error) {
    console.log('deleteProduct',error.message)
  }
  
  
}



//for remove all product in cart 
const clearCart=async(req,res)=>{
 
  try {

    const currentUser=req.session.user

    const deleteProducts = await Cart.updateOne({user:currentUser},{$set: {items :[]}})

    return res.status(200).json({success:true,message:"Your cart is empty"})
    
  } catch (error) {
    console.log('Error from clearCart ',error.message)
  }

  
}





module.exports = {
  loadCart,
  addCart,
  totalAmount,
  deleteProduct,
  clearCart
}