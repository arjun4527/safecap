const Cart = require("../../models/cart-model")
const AddProducts = require("../../models/product-model")
const StatusCodes=require("../../config/statusCode")




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


    const response={
      success:false,
      message:""
    }


    const currentProduct = await AddProducts.findById(productId);
    if (!currentProduct) {
      response.message="Product not found"
      return res.status(StatusCodes.NOT_FOUND).json(response);
    }

    
    let cart = await Cart.findOne({ user: currentUser });

    if (cart) {
    
      let itemIndex = cart.items.findIndex(p => p.product.toString() === productId.toString() && p.size === size);

      if (itemIndex > -1) {
        response.message="Product already exist in your cart"
        return res.status(StatusCodes.OK).json(response)
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
      response.success=true
      response.message= "Cart updated successfully"
      return res.status(StatusCodes.OK).json(response);
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
      response.success=true
      response.message= "Product added to cart successfully"
      return res.status(StatusCodes.CREATED).json(response);
    }

  } catch (error) {
    console.log("addCart error:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
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
  // console.log("happy",itemsWithCalculatedPrices)
  return itemsWithCalculatedPrices
}



const totalAmount = async (req, res) => {
  try {

    const { currentQty, id,size } = req.body


    const productData=await AddProducts.findOne(
      {_id:id,},
    {variants:{$elemMatch:{size:size}}})

    const variant=productData.variants[0]
    const stock=variant.stock
    
    if(currentQty>stock){
      return res.status(StatusCodes.OK).json({success:false,message:"Quantity exceeds available stock."})
    }
    
    if(currentQty>5){
      return res.status(StatusCodes.OK).json({success:false,message:"Maximum limit is 5"})
    }
   
    const currentUser = req.session.user

    let cart = await Cart.findOne({ user: currentUser })

    const itemIndex = await cart.items.findIndex(p => p.product.toString() == id && p.size === size)
    

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = currentQty;
    } else {
      return res.status().json({ message: 'Product not found in cart' });
    }
    const newCart = await cart.save();

    
    const itemsWithPrices = await calculateProductPrices(newCart,itemIndex);

    return res.status(StatusCodes.OK).json({success:true,itemsWithPrices:itemsWithPrices})
    
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

  return res.status(StatusCodes.OK).json({success:true,message:"Removed successfully"})
  } catch (error) {
    console.log('deleteProduct',error.message)
  }
  
  
}



//for remove all product in cart 
const clearCart=async(req,res)=>{
 
  try {

    const currentUser=req.session.user

    const deleteProducts = await Cart.updateOne({user:currentUser},{$set: {items :[]}})

    return res.status(StatusCodes.OK).json({success:true,message:"Your cart is empty"})
    
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