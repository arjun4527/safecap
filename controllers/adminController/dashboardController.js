const Orders=require("../../models/order-model")
const PDFDocument = require('pdfkit');
const AddProducts = require("../../models/product-model")
const Brands=require("../../models/brand-model")
const moment=require('moment')





//for render Dashboard
const loadDashboard = async (req, res) => {
  try {
  
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

  
    const query = { orderDate: { $gte: startDate, $lte: endDate },
                     orderStatus:"delivered"
                   };
    const orderData = await Orders.find(query).skip(skip).limit(limit);


    const totalOrders = await Orders.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

  
    let resultArray = [];
    let totalAmount = 0;

    orderData.forEach((order) => {
      let subTotal = 0;

      order.items.forEach((item) => {
        subTotal += item.price * item.quantity; 
      });

      const shippingPrice = order.shippingPrice || 0;
      const taxPrice = order.taxPrice || 0;
      const couponDiscountAmount=order.couponDiscountAmount

      const total = subTotal + shippingPrice + taxPrice-couponDiscountAmount;

      resultArray.push({
        id: order.id,
        orderDate: order.orderDate || null,
        subTotal,
        shippingPrice,
        taxPrice,
        total,
        couponDiscountAmount
      });

      
      totalAmount += order.grandTotal || 0;
    });

    let totalCouponDiscountAmount =0
    orderData.forEach(order=>{
      totalCouponDiscountAmount +=order.couponDiscountAmount
  })



  //for total datas
  const totalNoOfOrders=await Orders.countDocuments()
    console.log("order",totalNoOfOrders)


    const totalProduct=await AddProducts.countDocuments()
    console.log("product",totalProduct)

    const totalRevenue = await Orders.aggregate([
      {
          $group: {
              _id: null, 
              totalGrandTotal: { $sum: "$grandTotal" }
          }
      }
  ])

  const totalBrands=await Brands.countDocuments()


 




  
    res.render("dashboard", {
      resultArray,
      totalAmount,
      totalPages,
      currentPage: page,
      totalCouponDiscountAmount,
      totalOrders,
      totalNoOfOrders,
      totalProduct,
      totalRevenue,
      totalBrands
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};





//for today report
const todayReport=async(req,res)=>{

    let startDate = new Date();
startDate.setHours(0, 0, 0);

let endDate = new Date();
endDate.setHours(23, 59, 59);

try{
 const page = parseInt(req.query.page) || 1;
 const limit = 6;
 const skip = (page - 1) * limit;

 const query = { orderDate: { $gte: startDate, $lte: endDate },
                 orderStatus:"delivered"
               };

 
 const orderData = await Orders.find(query).skip(skip).limit(limit);


 const totalOrders = await Orders.countDocuments(query);
 
 const totalPages = Math.ceil(totalOrders / limit);

 let resultArray = [];
 let totalAmount = 0;

 orderData.forEach((order) => {
   let subTotal = 0;

   order.items.forEach((item) => {
     subTotal += item.price * item.quantity; 
   });

   const shippingPrice = order.shippingPrice || 0;
   const taxPrice = order.taxPrice || 0;
   const couponDiscountAmount=order.couponDiscountAmount

   const total = (subTotal + shippingPrice + taxPrice)-couponDiscountAmount;


  
   resultArray.push({
     id: order.id,
     orderDate: order.orderDate || null,
     subTotal,
     shippingPrice,
     taxPrice,
     total,
     couponDiscountAmount
   });

   
   totalAmount += order.grandTotal || 0;
 });

 let totalCouponDiscountAmount =0
    orderData.forEach(order=>{
      totalCouponDiscountAmount +=order.couponDiscountAmount
  })
  // console.log("dis",totalCouponDiscountAmount)


  const totalNoOfOrders=await Orders.countDocuments()
    console.log("order",totalNoOfOrders)


    const totalProduct=await AddProducts.countDocuments()
    console.log("product",totalProduct)

    const totalRevenue = await Orders.aggregate([
      {
          $group: {
              _id: null, 
              totalGrandTotal: { $sum: "$grandTotal" }
          }
      }
  ])

  const totalBrands=await Brands.countDocuments()

 res.render("dashboard", {
   resultArray,
   totalAmount,
   totalPages,
   currentPage: page,
   totalCouponDiscountAmount,
   totalOrders,totalNoOfOrders,
   totalProduct,
   totalRevenue,
   totalBrands
 });
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
    
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;


    const query = { orderDate: { $gte: startDate, $lte: endDate },orderStatus:"delivered" };

  
    const orderData = await Orders.find(query).skip(skip).limit(limit);

    
    const totalOrders = await Orders.countDocuments(query);

    const totalPages = Math.ceil(totalOrders / limit);

  
    let resultArray = [];
    let totalAmount = 0;

    orderData.forEach((order) => {
      let subTotal = 0;

      order.items.forEach((item) => {
        subTotal += item.price * item.quantity;
      });

      const shippingPrice = order.shippingPrice || 0;
      const taxPrice = order.taxPrice || 0;
      const couponDiscountAmount=order.couponDiscountAmount

      const total = subTotal + shippingPrice + taxPrice-couponDiscountAmount;


  
      resultArray.push({
        id: order.id,
        orderDate: order.orderDate || null,
        subTotal,
        shippingPrice,
        taxPrice,
        total,
        couponDiscountAmount,
        
      });

      
      totalAmount += order.grandTotal || 0;
    });
    let totalCouponDiscountAmount =0
    orderData.forEach(order=>{
      totalCouponDiscountAmount +=order.couponDiscountAmount
  })

  const totalNoOfOrders=await Orders.countDocuments()
    console.log("order",totalNoOfOrders)


    const totalProduct=await AddProducts.countDocuments()
    console.log("product",totalProduct)

    const totalRevenue = await Orders.aggregate([
      {
          $group: {
              _id: null, 
              totalGrandTotal: { $sum: "$grandTotal" }
          }
      }
  ])

  const totalBrands=await Brands.countDocuments()


    res.render("dashboard", {
      resultArray,
      totalAmount,
      totalPages,
      currentPage: page,
      totalCouponDiscountAmount,
      totalOrders,
      totalNoOfOrders,
      totalProduct,
      totalRevenue,
      totalBrands
    });

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
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

  
    const query = { orderDate: { $gte: startDate, $lte: endDate },orderStatus:"delivered" };

  
    const orderData = await Orders.find(query).skip(skip).limit(limit);

    
    const totalOrders = await Orders.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    let resultArray = [];
    let totalAmount = 0;

    orderData.forEach((order) => {
      let subTotal = 0;

      order.items.forEach((item) => {
        subTotal += item.price * item.quantity; 
      });

      const shippingPrice = order.shippingPrice || 0;
      const taxPrice = order.taxPrice || 0;
      const couponDiscountAmount=order.couponDiscountAmount

      const total = subTotal + shippingPrice + taxPrice-couponDiscountAmount;



      resultArray.push({
        id: order.id,
        orderDate: order.orderDate || null,
        subTotal,
        shippingPrice,
        taxPrice,
        total,
        couponDiscountAmount,
        
      });


      totalAmount += order.grandTotal || 0;
    });

    let totalCouponDiscountAmount =0
    orderData.forEach(order=>{
      totalCouponDiscountAmount +=order.couponDiscountAmount
  })

  const totalNoOfOrders=await Orders.countDocuments()
    console.log("order",totalNoOfOrders)


    const totalProduct=await AddProducts.countDocuments()
    console.log("product",totalProduct)

    const totalRevenue = await Orders.aggregate([
      {
          $group: {
              _id: null, 
              totalGrandTotal: { $sum: "$grandTotal" }
          }
      }
  ])

  const totalBrands=await Brands.countDocuments()

  console.log("monthlyyyyyyyyyy",resultArray)



  
    res.render("dashboard", {
      resultArray,
      totalAmount,
      totalPages,
      currentPage: page,
      totalCouponDiscountAmount,
      totalOrders,
      totalNoOfOrders,
      totalProduct,
      totalRevenue,
      totalBrands
    });
  } catch (error) {
    console.log("Error from the monthlyReport",error.message)

  }
}




//for custom report 
const customReport=async(req,res)=>{
  try {
    const {startDate,endDate}=req.body

    const page=parseInt(req.query.page) || 1
    const limit=6
    const skip=(page-1)* limit

    const query = { orderDate: { $gte: startDate, $lte: endDate } };
   
    const orderData = await Orders.find(query).skip(skip).limit(limit);

    const totalOrders = await Orders.countDocuments(query);

    const totalPages=Math.ceil(totalOrders/limit)

    let resultArray = []; 

orderData.forEach((order) => {
  let subTotal = 0; 

  
  order.items.forEach((item) => {
    subTotal += item.price * item.quantity;
  });

  const shippingPrice = order.shippingPrice || 0;
  const taxPrice = order.taxPrice || 0; 
  const couponDiscountAmount=order.couponDiscountAmount ||0

  const total = (subTotal + shippingPrice + taxPrice)-couponDiscountAmount || 0 


  resultArray.push({
    id: order.id,
    orderDate: order.orderDate || null, 
    subTotal,
    shippingPrice,
    taxPrice,
    total,
    couponDiscountAmount,
    
  });
});


    let totalAmount=0
      orderData.forEach(order=>{
          totalAmount +=order.grandTotal
      })

    let totalCouponDiscountAmount =0
    orderData.forEach(order=>{
      totalCouponDiscountAmount +=order.couponDiscountAmount
  })

  const totalNoOfOrders=await Orders.countDocuments()
    console.log("order",totalNoOfOrders)


    const totalProduct=await AddProducts.countDocuments()
    console.log("product",totalProduct)

    const totalRevenue = await Orders.aggregate([
      {
          $group: {
              _id: null, 
              totalGrandTotal: { $sum: "$grandTotal" }
          }
      }
  ])

  const totalBrands=await Brands.countDocuments()
  
      res.render("dashboard",{resultArray,totalAmount,totalPages,currentPage:page,totalCouponDiscountAmount,totalOrders,totalNoOfOrders,
        totalProduct,
        totalRevenue,
        totalBrands})
  } catch (error) {
    console.log("Error from the customReport",error.message)

  }
}



//for chart
const updateChart=async(req,res)=>{
  try {
    
    const {period}=req.body
    console.log("periodddd",period)

    let startDate
    let endDate
    let array = [];


    if(period==='today'){
      startDate = new Date();
      startDate.setHours(0, 0, 0);
    
    endDate = new Date();
    endDate.setHours(23, 59, 59);
    }else if(period==='weekly'){
      startDate = new Date();
          startDate.setDate(startDate.getDate() - startDate.getDay());

          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
    }else if(period==='monthly'){
       startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
       endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
           endDate.setHours(23, 59, 59, 999);
    }
    
   console.log("sd",startDate)
   console.log("ed",endDate)
    const query = { orderDate: { $gte: startDate, $lte: endDate },
                 orderStatus:"delivered"
               };

 let sum=0

 const orderData = await Orders.find(query)
 console.log('ordderDat',orderData)

 if(period==='today'){
  orderData.forEach((order) => {
    let subTotal = 0;
  
    order.items.forEach((item) => {
      subTotal += item.price * item.quantity; 
    });
  
    const shippingPrice = order.shippingPrice || 0;
    const taxPrice = order.taxPrice || 0;
    const couponDiscountAmount=order.couponDiscountAmount
  
  


     const total = (subTotal + shippingPrice + taxPrice) - couponDiscountAmount;

     sum=sum+total
     
   })
   array.push(sum);
   console.log("todayyy",array)

     
 }

 if(period==='weekly'){
 
   const query = { orderDate: { $gte: startDate, $lte: endDate },
                 orderStatus:"delivered"}

   const orderData = await Orders.find(query)

   console.log("weekend",orderData)

 array = Array(7).fill(0);

 orderData.forEach(order => {
    const orderDate = new Date(order.orderDate);
    const dayIndex = orderDate.getDay(); 
    array[dayIndex] += order.grandTotal
    console.log("weekly",array)

});
 }


 if(period==='monthly'){
  const query = { orderDate: { $gte: startDate, $lte: endDate },
  orderStatus:"delivered"
};

const orderData = await Orders.find(query)
console.log("monthend",orderData)

let currentStartDate = new Date(startDate);

while (currentStartDate <= endDate) {

    let currentEndDate = new Date(currentStartDate);
    currentEndDate.setDate(currentEndDate.getDate() + 6);
    if (currentEndDate > endDate) {
        currentEndDate = endDate;
    }
    const weekSum = orderData
        .filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate >= currentStartDate && orderDate <= currentEndDate;
        })
        .reduce((sum, order) => sum + order.grandTotal, 0);

    
    array.push(weekSum);

    currentStartDate.setDate(currentStartDate.getDate() + 7);
    console.log("monthoo",array)
}
 }



 if(period==='yearly'){
  
  let startDate = new Date(new Date().getFullYear(), 0, 1); 

let endDate = new Date(new Date().getFullYear(), 11, 31);
  const query = { orderDate: { $gte: startDate, $lte: endDate },
  orderStatus:"delivered"
};

const orderData = await Orders.find(query)


let currentStartDate = new Date(startDate);

while (currentStartDate <= endDate) {

    let currentEndDate = new Date(currentStartDate);
    currentEndDate.setDate(currentEndDate.getDate() + 30);
    if (currentEndDate > endDate) {
        currentEndDate = endDate;
    }
    const weekSum = orderData
        .filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate >= currentStartDate && orderDate <= currentEndDate;
        })
        .reduce((sum, order) => sum + order.grandTotal, 0);

    
    array.push(weekSum);

    currentStartDate.setDate(currentStartDate.getDate() + 30);
    console.log("yearoo",array)
}
 }
 
  return res.json({success:true,amount:array})

  } catch (error) {
    console.log("Error from chart",error.message)
  }
}









module.exports={
  todayReport,
  loadDashboard,
  weekReport,
  monthlyReport,
  customReport,
  updateChart
  
  
}