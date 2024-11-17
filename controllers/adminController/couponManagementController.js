const Coupon=require("../../models/coupon-model")
const StatusCodes=require("../../config/statusCode")



//for load coupon list
const loadCouponList=async(req,res)=>{
  try {

    const couponAddedMessage=req.session.couponAddedMessage

    req.session.couponAddedMessage=null

    const couponData=await Coupon.find({})
  

    return res.render("couponList",{couponAddedMessage,couponData})
  } catch (error) {
    console.log("Error from loadCouponList",error.message)

  }
} 




// for load add coupon
const loadAddCoupon=async(req,res)=>{
  try {
    return res.render("addCoupon")

  } catch (error) {
    console.log("Error from loadAddCoupon",error.message)

  }
}




//for add coupon
const addCoupon=async(req,res)=>{
  try {
    const {couponName,couponDescription,couponCode,couponDiscount,maxAmount,minAmount}=req.body

    // const currentUser=req.session.user
    // console.log("user",currentUser)

  const newCoupon=await Coupon.create({
    couponName,
    couponDescription,
    couponCode,
    couponDiscount,
    maxAmount,
    minAmount,
    
  })

  await newCoupon.save()

  req.session.couponAddedMessage="Coupon Added SuccesFully"
  
  return res.status(StatusCodes.OK).redirect("/admin/coupon")




  } catch (error) {
    console.log("Error from addCoupon",error.message)
  }
} 




//for Coupon status in productList page
  
const couponStatus=async(req,res)=>{
    
    
  try {
    const {couponId} =req.body
    
    
  const newCoupon=await Coupon.findById(couponId)
  

 const status=!newCoupon.is_blocked
 

  const coupon=await Coupon.findByIdAndUpdate(couponId,
    {$set:{is_blocked:status}},
    {new:true}
      
  )
    return res.status(StatusCodes.OK).json({
       success:true,
       messsage:"Coupon status updated successfully",
       coupon:coupon
    })


  } catch (error) {
     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal Server Error' });
  }
}



module.exports={
  loadCouponList,
  loadAddCoupon,
  addCoupon,
  couponStatus
}