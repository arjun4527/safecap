const Orders=require("../../models/order-model")



//for render Dashboard
const loadDashboard=async(req,res)=>{
  try {
    let startDate = new Date();
    startDate.setHours(0, 0, 0);
    
    let endDate = new Date();
    endDate.setHours(23, 59, 59);

    const query = { orderDate: { $gte: startDate, $lte: endDate } };


  const orderData = await Orders.find(query);

  let resultArray = []; // Array to store the result

  orderData.forEach((order) => {
    let subTotal = 0; // Initialize subTotal for each order
  
    // Calculate subTotal for the current order
    order.items.forEach((item) => {
      subTotal += item.price * item.quantity;
    });
  
    // Add shipping and tax to the order's total
    const shipping = order.shippingPrice || 0; // Default to 0 if shipping is not provided
    const tax = order.taxPrice || 0; // Default to 0 if tax is not provided
    const total = subTotal + shipping + tax;
  
    // Add the order's id, subTotal, shipping, tax, date, and total to the result array
    resultArray.push({
      id: order.id,
      orderDate: order.orderDate || null, // Include order date (null if missing)
      subTotal,
      shipping,
      tax,
      total,
    });
  });
  
  // Log the resulting array
  console.log("Resulting Array:", resultArray);
    
    res.render("dashboard",{orderData,resultArray})
  } catch (error) {
    console.log(error.message)
  }
}




//for
const todayReport=async(req,res)=>{

    let startDate = new Date();
startDate.setHours(0, 0, 0);

let endDate = new Date();
endDate.setHours(23, 59, 59);


const query = { orderDate: { $gte: startDate, $lte: endDate } };

try {
  const orderData = await Orders.find(query);

  let totalAmount=0
  orderData.forEach(order=>{
      totalAmount +=order.grandTotal
  })

  res.render("dashboard",{orderData,totalAmount})
  } catch (error) {
    console.log("Error from the todayReport",error.message)
  }
}




//for weel report
const weekReport=async(req,res)=>{
         let startDate = new Date();
          startDate.setDate(startDate.getDate() - startDate.getDay());

         let endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
  try {
    const query = { orderDate: { $gte: startDate, $lte: endDate } };
   
    const orderData = await Orders.find(query);
    
    let resultArray = []; // Array to store the result

orderData.forEach((order) => {
  let subTotal = 0; // Initialize subTotal for each order

  // Calculate subTotal for the current order
  order.items.forEach((item) => {
    subTotal += item.price * item.quantity;
  });

  // Add shipping and tax to the order's total
  const shipping = order.shippingPrice || 0; // Default to 0 if shipping is not provided
  const tax = order.taxPrice || 0; // Default to 0 if tax is not provided
  const total = subTotal + shipping + tax;

  // Add the order's id, subTotal, shipping, tax, date, and total to the result array
  resultArray.push({
    id: order.id,
    orderDate: order.orderDate || null, // Include order date (null if missing)
    subTotal,
    shipping,
    tax,
    total,
  });
});

// Log the resulting array
console.log("Resulting Array:", resultArray);

    
    let totalAmount=0
      orderData.forEach(order=>{
          totalAmount +=order.grandTotal
      })
      res.render("dashboard",{resultArray,totalAmount})

    
  } catch (error) {
    console.log("Error from the weekReport",error.message)

  }
}









module.exports={
  todayReport,
  loadDashboard,
  weekReport
}