const User=require("../../models/user-model")
const bcrypt=require("bcrypt")
const Categories=require("../../models/category-model")
const Brands=require("../../models/brand-model")
const AddProducts = require("../../models/product-model")
const path=require('path')
const { log } = require("console")
const sharp = require('sharp');
const StatusCodes=require("../../config/statusCode")





//for render brands.ejs
const loadbrands=async(req,res)=>{
  try {
    const added=req.session.brandAdded 
    const updateBrand=req.session.updateBrand
    
    req.session.brandAdded=null
    req.session.updateBrand=null
  
    const brandsData=await Brands.find({})
    
    return res.render("brands",{brandsData:brandsData,added,updateBrand})
  } catch (error) {
    console.log(error.message)

  }
}




//for add brand
const addbrands=async(req,res)=>{
  try {

    const isBrandExist=await Brands.findOne({name:req.body.brandName})
    const brandsData=await Brands.find({})
    if(isBrandExist){
      const brandExist="Brand name is already exist,Choose another one"
      
      return res.render("brands", {
        
        brandsData,
        brandExist 
    });
    }
   
    const brand=new Brands({
      name:req.body.brandName,
      image:req.file.filename
    })

    const brandData=await brand.save()

    if(brandData){
      req.session.brandAdded="Brand Added Successfully"
      return res.redirect("/admin/brands")
    }
  } catch (error) {
    console.log(error.message)
  }
}




//for edit Brand
const editBrand=async(req,res)=>{
  try {
    const {brandName,brandId}=req.body
    const brandImage =  req?.file?.filename;

    // const isbrandExist=await Brands.findOne({name:brandName})
    const isbrandExist = await Brands.findOne({
      name: brandName,        
      _id: { $ne: brandId }   
    });
    const brandData=await Brands.findById(brandId)

    if(isbrandExist){
      const exist="Brand name is already exist,Choose another one"

      return res.render("editBrand",{

        exist,
        brandData
      })
    }

    
    if(brandName || brandImage){
      const updatedBrand=await Brands.findByIdAndUpdate(
        brandId,
        {
          $set:{
            name: brandName,
            image:brandImage
          }
        },
        {new:true}
      )
      req.session.updateBrand="Updation Successfully Completed"
      return res.redirect('/admin/brands')
    }


   
   
  } catch (error) {
    console.error("Error updating brand:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
  }
}





//for render edit brand

const loadEditBrand=async(req,res)=>{
  try {
    
    const  id  = req.query.id
    
    const brandData=await Brands.findById(id)
    

    
    
    
    return res.render('editBrand',{brandData})
    

  } catch (error) {
    console.log(error.message)
  }
}


// for remove brand image
const removeBrandImage=async(req,res)=>{

  try {

    const { brandImag, id } = req.body;
    

    const brand=await Brands.findByIdAndUpdate(
      id,
      {$set:{image:null}},
      {new:true}
    )
    
  return  res.json({ success:true,message:'image removed successfully' });
  
  } catch (error) {
    console.error('Error deleting image:', error);
    res.json({ success: false,message:'image removed failed' });
  }
}




// for Brand status
const brandStatus=async(req,res)=>{
    
  try {
    const {brandId} =req.body
    // console.log("gomi",brandId)

  const newBrand=await Brands.findById(brandId)
  
 const status=!newBrand.is_blocked
 
  const brand=await Brands.findByIdAndUpdate(brandId,
    {$set:{is_blocked:status}},
    {new:true}
    
  )
  console.log("appu",brand)

  
    return res.status(StatusCodes.OK).json({
       success:true,
       messsage:"Brand status updated successfully",
       brand:brand
    })


  } catch (error) {
     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal Server Error' });
  }
}


module.exports={
  loadbrands,
  addbrands,
  editBrand,
  loadEditBrand,
  removeBrandImage,
  brandStatus
}