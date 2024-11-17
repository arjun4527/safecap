const AddProducts = require("../../models/product-model")
const ProductOffer = require("../../models/productOffer-model")
const StatusCodes=require("../../config/statusCode")
const Brands=require("../../models/brand-model")
const BrandOffer = require("../../models/brandOffer-model")









//for load product  list
const loadProductOffer=async(req,res)=>{
  try {
    const productOffer= req.session.newProductOffer

    const updatedOffer=req.session.updatedOffer
    
    req.session.newProductOffer=null

    req.session.updatedOffer=null

    const productOfferData=await ProductOffer.find({})

    return res.render("productOfferList",{productOffer,productOfferData,updatedOffer})
  } catch (error) {
    console.log("Error from load product offer",error.message)
  }
}




//for add offer  list
const loadAddProductOffer=async(req,res)=>{
  try {

    const offerNameExist=req.session.isOfferNameexisting

    req.session.isOfferNameexisting=null
     
    const productData = await AddProducts.find({
      variants: {
        $not: { $elemMatch: { offerPrice: { $exists: true } } }
      }
    });
    

    return res.render("addOffer",{productData,offerNameExist})
  } catch (error) {
    console.log("Error from load add offer",error.message)
  }
}




//for add offer
const addProductOffer=async(req,res)=>{
  try {
    const {offerName,productId,offerDiscount,}=req.body

    const isOfferNameexisting=await ProductOffer.findOne({offerName:offerName})

    if(isOfferNameexisting){
      req.session.isOfferNameexisting="An offer with this name already exists. Please choose a different name."

      return res.redirect("/admin/addOffer")
    }

    const newProductOffer=await ProductOffer.create({
      offerName,
      productId,
      offerDiscount,
     
    })

    await newProductOffer.save()

    req.session.newProductOffer="Product Offer Added Successfully"

    //for offer start
    const currentProduct=await AddProducts.findById(productId)

    currentProduct.variants =currentProduct.variants.map(variant=>{
        
      const offerPrice=Math.ceil(variant.price - (variant.price/100)*offerDiscount)
      return { ...variant, offerPrice };
    })

    await currentProduct.save()

    return res.redirect("/admin/productOffer")

  } catch (error) {
    console.log("Error from  addProductOffer",error.message)

  }
}




//for delete offer
const deleteOffer=async(req,res)=>{
  try {
    const {id}=req.body

    const offerData=await ProductOffer.findById(id)

    const productId=offerData?.productId

    const productData=await AddProducts.updateOne(
      { _id: productId }, 
      { 
          $unset: { "variants.$[].offerPrice": "" } 
      }
  );

  const offerDelete = await ProductOffer.deleteOne({ _id: id });

  return res.status(StatusCodes.OK).json({success:true,message:"Offer Delete Successfully"})


  } catch (error) {
    console.log("Error from deleteOffer",error.message)
  }
}




//for load update offer
const loadUpdateOffer=async(req,res)=>{
  try {
    const {offerId}=req.query
    
    const offerData=await ProductOffer.findById(offerId)

    const productId=offerData.productId

    const productData=await AddProducts.findOne({_id:productId})

    res.render ("editProductOffer",{productData,offerData})
  } catch (error) {
    console.log("Error from load UpadteOffer",error.message)
  }
}




// for edit product offer
const editProductOffer=async(req,res)=>{

try {
  const {offerName,offerId,productName,offerDiscount}=req.body

  const updatedOffer=await ProductOffer.findByIdAndUpdate(
    offerId,
    {
      $set:{
        offerName,
        offerDiscount,
       

      },
    },
    {new:true}
  )

  const offerData = await ProductOffer.findById(offerId);

const productId = offerData.productId;

const currentProduct = await AddProducts.findById(productId);

let isModified = false; // To track if we modified any variant

currentProduct.variants.forEach(variant => {
    const updatedOfferPrice = Math.ceil(variant.price - (variant.price * offerDiscount / 100));
    console.log("newPrice", updatedOfferPrice);
    console.log("oldPrice", variant.price);

    if ( variant.offerPrice > updatedOfferPrice) {
        variant.offerPrice = updatedOfferPrice;
        isModified = true; 
    }
});


if (isModified) {
    await currentProduct.save();
    console.log("Product updated successfully.");
} else {
    console.log("No changes made to the product.");
}


  req.session.updatedOffer="Updation Successfully Completed"
  return res.redirect("/admin/productOffer"); 


} catch (error) {
  console.log("Error from edit ProductOffer",error.message)
}
}




//for load brand offer list
const loadBrandOffer=async(req,res)=>{
 try {
 const brandOfferData=await BrandOffer.find({})

  res.render("brandOfferList",{brandOfferData})
 } catch (error) {
  console.log("Error from loadBrandOffer",error.message)
 }
}




// for load addBrandOffer
const loadAddBrandOffer=async(req,res)=>{
  try {

    const offerNameExist=req.session.isOfferNameexisting

    const brandOfferExist=req.session.brandOfferExist

    req.session.isOfferNameexisting=null

    req.session.brandOfferExist=null
    
    const brandData=await Brands.find({})

    res.render("addBrandOffer",{brandData,offerNameExist,brandOfferExist})

  } catch (error) {
    console.log("Error from loadAddBrandOffer",error.message)
  }
} 




//for add brand offer
const addBrandOffer=async(req,res)=>{
  try {
    const { ObjectId } = require('mongoose').Types;


    const {offerName,brandId,offerDiscount}=req.body



    const isOfferNameexisting=await BrandOffer.findOne({offerName:offerName})

    if(isOfferNameexisting){
      req.session.isOfferNameexisting="An offer with this name already exists. Please choose a different name."

      return res.redirect("/admin/addBrandOffer")
    }

    const brandOfferExist=await BrandOffer.findOne({brandId:brandId})

    if(brandOfferExist){
      req.session.brandOfferExist="This Brand has already a offer.Choose another one"

      return res.redirect("/admin/addBrandOffer")
    }

    const newBrandOffer=await BrandOffer.create({
      offerName,
      brandId,
      offerDiscount,
      
    })

    await newBrandOffer.save()

    req.session.newProductOffer="Product Offer Added Successfully"

    //for offer start
    // const currentBrand=await Brands.findById(brandId)

    const products = await AddProducts.find({ brand:brandId});

    console.log("producta",products)

    const isOfferPriceExist = products.every(product =>
      product.variants.some(variant => variant.offerPrice !== undefined)
    );
    console.log("isOfferPriceExist", isOfferPriceExist);
    
   if(isOfferPriceExist){
     
    const originalPrice=products[0].variants[0].price

    console.log("originalPrice",originalPrice)

    const offerPrice=products[0].variants[0].offerPrice

    console.log("offerPrice",offerPrice)


    const productOfferDiscount=Math.ceil(((originalPrice-offerPrice)/originalPrice)*100)

    console.log("productOfferDiscount",productOfferDiscount)

    if(productOfferDiscount<Number(offerDiscount)){
        console.log("nithuin")
      products.forEach(product => {
        product.variants.forEach(variant => {
            
            const newOfferPriceByBrandOffer = Math.ceil(variant.price - (variant.price * offerDiscount / 100));
            
            console.log("new offer orce",newOfferPriceByBrandOffer);
            
            // Update the offerPrice field
            variant.offerPrice = newOfferPriceByBrandOffer;

            console.log("offerPrice",  variant.offerPrice)
          });
           product.save()

       });

    }
    
   }else{

    for (const product of products) {
      for (const variant of product.variants) {
          if (variant.price) {
              // Add a new field 'offerPrice' and calculate its value
              variant.offerPrice = 0; // Initialize with a default value
              const discount = (variant.price * offerDiscount) / 100;
              variant.offerPrice = variant.price - discount; 
          }
      }
      
      await product.save(); 
  }
  

   }

   return res.redirect("/admin/brandOffer")


  } catch (error) {
    console.log("Error from addBrandOffer",error.message)
  }
} 




//for delete brand Offer
const deleteBrandOffer=async (req,res)=> {
  try {
    
      const {id}=req.body
  
      const brandOfferData=await BrandOffer.findById(id)
  
      const brandId=brandOfferData?.brandId
  
      const productData=await AddProducts.updateMany(
        { brand: brandId }, 
        { 
            $unset: { "variants.$[].offerPrice": "" } 
        }
    );
  
    const barndOfferDelete = await BrandOffer.deleteOne({ _id: id });

    const products=await AddProducts.find({brand:brandId})

    for (const product of products) {
      const productOffer = await ProductOffer.findOne({ productId: product._id });
  
      if (productOffer) {
          await ProductOffer.deleteOne({ _id: productOffer._id });
      }
  }
  
    return res.status(StatusCodes.OK).json({success:true,message:"Offer Delete Successfully"})
  
  } catch (error) {
    console.log("Errro from deleteBrandOffer",error.message)
  }
}




// for load edit brand offer
const loadUpdateBrandOffer=async(req,res)=>{
  try {
    const {offerId}=req.query
    
    const offerData=await BrandOffer.findById(offerId)

    const brandData=await Brands.findById(offerData.brandId)

    res.render ("editBrandOffer",{offerData,brandData})
  } catch (error) {
    console.log("Errro from loadUpdateBrandOffer",error.message)

  }
}




//for edit brand Offer
const editBrandOffer=async(req,res)=>{
  try {
    const {offerName,offerId,offerDiscount}=req.body

  const updatedOffer=await BrandOffer.findByIdAndUpdate(
    offerId,
    {
      $set:{
        offerName,
        offerDiscount,
       

      },
    },
    {new:true}
  )

  const offerData = await BrandOffer.findById(offerId);


const products = await AddProducts.find({brand:offerData.brandId});


products.forEach(currentProduct=>{
  currentProduct.variants.forEach(variant => {
    const updatedOfferPrice = Math.ceil(variant.price - (variant.price * offerDiscount / 100));
    console.log("newPrice", updatedOfferPrice);
    console.log("oldPrice", variant.price);

    if ( variant.offerPrice > updatedOfferPrice) {
        variant.offerPrice = updatedOfferPrice;
        
    }
});
 currentProduct.save();

})

  req.session.updatedOffer="Updation Successfully Completed"
  return res.redirect("/admin/BrandOffer");
  } catch (error) {
    console.log("Errro from editBrandOffer",error.message)

  }
}











module.exports={
  loadProductOffer,
  loadAddProductOffer,
  addProductOffer,
  deleteOffer,
  loadUpdateOffer,
  editProductOffer,
  loadBrandOffer,
  loadAddBrandOffer,
  addBrandOffer,
  deleteBrandOffer,
  loadUpdateBrandOffer,
  editBrandOffer
}