const User=require("../../models/user-model")
const bcrypt=require("bcrypt")
const Categories=require("../../models/category-model")
const Brands=require("../../models/brand-model")
const AddProducts = require("../../models/product-model")
const path=require('path')
const { log } = require("console")
const sharp = require('sharp');



//for render addProduct
const loadAddProduct=async(req,res)=>{
  try{

    const  productExist=req.session.productExists

    req.session.productExists=null

    const brandsData = await Brands.find({})
    const categoryData = await Categories.find({})
    return res.render("addProduct",{brandsData,categoryData,productExist})
  }catch(error){
    console.log(error.message)
  }
} 


//for add product
const addProduct = async (req, res) => {
  try {
    const { productName, description, brandId, smallPrice, smallStock, mediumPrice, mediumStock, largePrice, largeStock, categoryId } = req.body;

    
    const productExists = await AddProducts.findOne({ productName: productName });
    if (productExists) {
      req.session.productExists="Product name already exists, please try with another name"
      return res.status(400).redirect('/admin/addProduct')
    }

    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json("Please upload at least one product image");
    }

    const images = [];

    
    for (let i = 0; i < req.files.length; i++) {
      const originalImagePath = req.files[i].path;

      
      const resizedImageName = `${path.parse(req.files[i].filename).name}-resized${path.extname(req.files[i].filename)}`;
      const resizedImagePath = path.join('public', 'productImages', resizedImageName);

  
      await sharp(originalImagePath)
        .resize({ width: 450, height: 450 })
        .toFile(resizedImagePath);

      
      images.push(resizedImageName);
    }

  
    const variants = [];
    if (smallPrice && smallStock) {
      variants.push({ size: 'small', price: smallPrice, stock: smallStock });
    }
    if (mediumPrice && mediumStock) {
      variants.push({ size: 'medium', price: mediumPrice, stock: mediumStock });
    }
    if (largePrice && largeStock) {
      variants.push({ size: 'large', price: largePrice, stock: largeStock });
    }

    
    const newProduct = new AddProducts({
      productName,
      description,
      brand: brandId,
      variants,
      category: categoryId,
      productImage: images, 
      createdAt: new Date(),
    });

    
    await newProduct.save();

    req.session.productAdded="Product Added Successfully"
    return res.redirect('/admin/productList')

  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Error adding product');
  }
};







//for render productList
const  loadProductList=async(req,res)=>{
  try {
    
    const productData=await AddProducts.find().populate('category').populate('brand')

    const productAdded= req.session.productAdded
    const updateProduct= req.session.updateProduct

    req.session.productAdded=null
    req.session.updateProduct=null

    return res.render("productList",{productData:productData,productAdded,updateProduct})
  } catch (error) {
    console.log(error.message)
  }
}





//for render productDetails
const loadProductDetails=async(req,res)=>{
const productId=req.query.id



const productData=await AddProducts.findOne({_id: productId}).populate('category').populate('brand')

  try{
    return res.render("productDetails",{productData:productData})
  }catch(error){
    console.log(error.mesage)
  }
}




//for render editProduct
const loadEditProduct=async(req,res)=>{

  const brandsData = await Brands.find({})
  const categoryData = await Categories.find({})  

  const productId=req.query.id

const productData=await AddProducts.findOne({_id: productId})
// console.log("boost",productData)


  try {
    return res.render("editProduct",{brandsData,categoryData,productData})
   

  } catch (error) {
    console.log(error.mesage)
  }
  }





  //for Remove Product Image
  const removeProductImage=async(req,res)=>{
    const {productImage,id}=req.body
    

    try {
      const product=await AddProducts.findByIdAndUpdate(
        id,
        {$pull:{productImage:productImage}},
        {new:true}
      )
      // console.log(product)

       
       return  res.json({success:true})


      
    } catch (error) {
      console.error('Error deleting image:', error);
      res.json({ success: false });
    }
  }




  //for Edit product
  const editProduct = async (req, res) => {
    try {
        const { productName, productId, description, brandId, categoryId, variants } = req.body;

        const images = req.files || [];

        const isProductNameExist = await AddProducts.findOne({
          name: productName,        
          _id: { $ne: productId }   
        });
        
        
        // console.log("kjsdfkjdsffd",isProductNameExist);
        
        const brandsData = await Brands.find({})
        const categoryData = await Categories.find({})
        const productData=await AddProducts.findById(productId)


        if(isProductNameExist){
          
          const exist="Product name is already exist,Choose another one  "

          return res.render('editProduct',{
            productData,
            exist,
            brandsData,
            categoryData

          })
        }

        

        const imageFilenames = images.map(img => img.filename); // Extract image filenames

        // Transform variants into array (if needed)
        const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
        const variantsArray = Object.keys(parsedVariants).map(sizeKey => ({
            size: sizeKey,
            price: parsedVariants[sizeKey].price,
            stock: parsedVariants[sizeKey].stock,
        }));

        const updatedProduct = await AddProducts.findByIdAndUpdate(
            productId,
            {
                $set: {
                    productName,
                    description,
                    brand: brandId,
                    category: categoryId,
                    variants: variantsArray,
                },
            },
            { new: true }
        );

        // If images are uploaded, update product images
        if (imageFilenames.length) {
            await AddProducts.findByIdAndUpdate(
                productId,
                { $push: { productImage: { $each: imageFilenames } } },
                { new: true }
            );
        }
        req.session.updateProduct="Updation Successfully Completed"
        return res.redirect("/admin/productList"); // Redirect after successful update
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};






  //for product status in productList page
  
  const productStatus=async(req,res)=>{
    
    
    try {
      const {productId} =req.body
      
      
    const newProduct=await AddProducts.findById(productId)
    

   const status=!newProduct.is_blocked
   

    const product=await AddProducts.findByIdAndUpdate(productId,
      {$set:{is_blocked:status}},
      {new:true}
        
    )
      return res.status(200).json({
         success:true,
         messsage:"Product status updated successfully",
         product:product
      })


    } catch (error) {
       return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }




module.exports={
  loadAddProduct,
  addProduct,
  loadProductList,
  loadProductDetails,
  loadEditProduct,
  removeProductImage,
  editProduct,
  productStatus,
}