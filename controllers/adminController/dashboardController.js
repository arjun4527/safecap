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

  let resultArray = []; 

  orderData.forEach((order) => {
    let subTotal = 0; 
  
    order.items.forEach((item) => {
      subTotal += item.price * item.quantity;
    });
  
    
    const shippingPrice = order.shippingPrice || 0; 
    const taxPrice = order.taxPrice || 0; 
    const total = subTotal + shippingPrice + taxPrice;
  
    
    resultArray.push({
      id: order.id,
      orderDate: order.orderDate || null, 
      subTotal,
      shippingPrice,
      taxPrice,
      total,
    });
  });

  let totalAmount=0
  orderData.forEach(order=>{
      totalAmount +=order.grandTotal
  })

  
    res.render("dashboard",{resultArray,totalAmount})
  } catch (error) {
    console.log(error.message)
  }
}




//for today report
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

  let resultArray = [];

  orderData.forEach((order) => {
    let subTotal = 0; 
  

    order.items.forEach((item) => {
      subTotal += item.price * item.quantity;
    });
  
    
    const shippingPrice = order.shippingPrice || 0; 
    const taxPrice = order.taxPrice || 0; 
    const total = subTotal + shippingPrice + taxPrice;

    resultArray.push({
      id: order.id,
      orderDate: order.orderDate || null, 
      subTotal,
      shippingPrice,
      taxPrice,
      total,
    });
  })
  
  res.render("dashboard",{resultArray,totalAmount})
  } catch (error) {
    console.log("Error from the todayReport",error.message)
  }
}




//for week report
const weekReport=async(req,res)=>{
         let startDate = new Date();
          startDate.setDate(startDate.getDate() - startDate.getDay());

         let endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
  try {
    const query = { orderDate: { $gte: startDate, $lte: endDate } };
   
    const orderData = await Orders.find(query);
    
    let resultArray = []; 

orderData.forEach((order) => {
  let subTotal = 0; 

  
  order.items.forEach((item) => {
    subTotal += item.price * item.quantity;
  });

  const shippingPrice = order.shippingPrice || 0;
  const taxPrice = order.taxPrice || 0; 
  const total = subTotal + shippingPrice + taxPrice;


  resultArray.push({
    id: order.id,
    orderDate: order.orderDate || null, 
    subTotal,
    shippingPrice,
    taxPrice,
    total,
  });
});


    let totalAmount=0
      orderData.forEach(order=>{
          totalAmount +=order.grandTotal
      })
      res.render("dashboard",{resultArray,totalAmount})

  } catch (error) {
    console.log("Error from the weekReport",error.message)

  }
}




// for monthly report
const monthlyReport=async(req,res)=>{

          let startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
          let endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
               endDate.setHours(23, 59, 59, 999);
  try {
    const query = { orderDate: { $gte: startDate, $lte: endDate } };
   
    const orderData = await Orders.find(query);
    
    let resultArray = []; 

orderData.forEach((order) => {
  let subTotal = 0; 

  
  order.items.forEach((item) => {
    subTotal += item.price * item.quantity;
  });

  const shippingPrice = order.shippingPrice || 0;
  const taxPrice = order.taxPrice || 0; 
  const total = subTotal + shippingPrice + taxPrice;


  resultArray.push({
    id: order.id,
    orderDate: order.orderDate || null, 
    subTotal,
    shippingPrice,
    taxPrice,
    total,
  });
});


    let totalAmount=0
      orderData.forEach(order=>{
          totalAmount +=order.grandTotal
      })
      res.render("dashboard",{resultArray,totalAmount})
  } catch (error) {
    console.log("Error from the monthlyReport",error.message)

  }
}




//for custom report 
const customReport=async(req,res)=>{
  try {
    const {startDate,endDate}=req.body
    console.log(startDate,endDate)
  } catch (error) {
    console.log("Error from the customReport",error.message)

  }
}









module.exports={
  todayReport,
  loadDashboard,
  weekReport,
  monthlyReport,
  customReport
}