const User=require("../models/user-model")
const bcrypt=require("bcrypt")
const Categories=require("../models/category-model")
const Brands=require("../models/brand-model")
const AddProducts = require("../models/product-model")
const path=require('path')
const { log } = require("console")
const sharp = require('sharp');

//for password hashing
const securePassword=async(password)=>{
  try{
    const passwordHash=await bcrypt.hash(password,10)
    return passwordHash
  }catch(error){
    console.log(error.message)
  }
}


//for render login
const loadLogin=async(req,res)=>{
  try {

    const noEntry=req.session.notAdmin || req.session.notExists || req.session.wrongPassword || req.session.serverError

    req.session.notAdmin=null
    req.session.notExists=null
    req.session.wrongPassword=null
    req.session.serverError=null

    res.render("adminLogin",{noEntry})
  } catch (error) {
    console.log(error.message)
  }
}


//for verify login
const verifyLogin=async(req,res)=>{
  try {
    const {adminEmail,adminPassword}=req.body
    console.log(adminEmail);
    
    const adminData=await User.findOne({email:adminEmail})

    if(!adminData){
      req.session.notExists="Check your emailID"
      return res.status(400).redirect('/admin')
      
    }

    const isMatch=await bcrypt.compare(adminPassword,adminData.password)

    if(isMatch){

      req.session.admin= adminData._id
      if(adminData.is_admin===1){
        res.redirect("/admin/dashboard")
      }else{
        req.session.notAdmin="your are not admin"
        return res.status(400).redirect('/admin')
      }
        
    }else{
       req.session.wrongPassword="Incorrect password"
      return res.status(400).redirect('/admin')
      
    }
  } catch (error) {
    req.session.serverError="Server Error"
    return res.status(500).redirect('/admin')
    
  }
}


//for render Dashboard
const loadDashboard=async(req,res)=>{
  try {
    res.render("dashboard")
  } catch (error) {
    console.log(error.message)
  }
}



//for render categories.ejs 
const loadCategories=async(req,res)=>{
  try {
    const added=req.session.categoryAdded
    const categoryExist= req.session.categoryExist

    req.session.categoryAdded=null
    req.session.categoryExist=null

    const categoriesData = await Categories.find({})
  
    return res.render("categories",{categoriesData:categoriesData,added,categoryExist})
  } catch (error) {
    console.log(error.message)
  }
}


//for add Categories
const addCategories=async(req,res)=>{
  try {
    const {categoriesName,categoriesDescription}=req.body

    const isCategoryExist=await Categories.findOne({name:categoriesName})

    if(isCategoryExist){
      req.session.categoryExist="Category name is already exist,Choose another one"
      return res.status(400).redirect('/admin/categories')
    }else{
      const category=new Categories({
        name:categoriesName,
        description:categoriesDescription,
       
      })
      // console.log(category)
  
      const categoriesData=await category.save()
  
      if(categoriesData){
        req.session.categoryAdded="Category Added Successfully"
        return res.redirect("/admin/categories")
  
      }
    }

    
  } catch (error) {
    console.log(error.message)
  }
}




//for render brands.ejs
const loadbrands=async(req,res)=>{
  try {
    const added=req.session.brandAdded || req.session.brandExist

    req.session.brandAdded=null
    req.session.brandExist=null

    const brandsData=await Brands.find({})
    
    return res.render("brands",{brandsData:brandsData,added})
  } catch (error) {
    console.log(error.message)

  }
}

//for add brand
const addbrands=async(req,res)=>{
  try {

    const isBrandExist=await Brands.findOne({name:req.body.brandName})

    if(isBrandExist){
      req.session.brandExist="Brand name is already exist,Choose another one"
      return res.status(400).redirect("/admin/brands")
    }
   
    const brand=new Brands({
      name:req.body.brandName,
      image:req.file.filename
    })

    const brandsData=await brand.save()

    if(brandsData){
      req.session.brandAdded="Brand Added Successfully"
      return res.redirect("/admin/brands")
    }
  } catch (error) {
    console.log(error.message)
  }
}




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

  
    return res.redirect('/admin/addProduct')

  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Error adding product');
  }
};







//for render productList
const  loadProductList=async(req,res)=>{
  try {
    
    const productData=await AddProducts.find().populate('category').populate('brand')
       
    return res.render("productList",{productData:productData})
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
console.log("boost",productData)


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

        // Ensure at least one image is uploaded
        if (!images.length) {
            return res.status(400).json({ message: "Please upload at least one product image" });
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
                    brandId,
                    categoryId,
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




  //for category status

  const categoryStatus=async(req,res)=>{
    try {
      const {categoryId}=req.body 
      

      const newCategory=await Categories.findById(categoryId)
      
      const currentValue=!newCategory.is_blocked

      const category=await Categories.findByIdAndUpdate(categoryId,
        {$set:{is_blocked:currentValue}},
        {new:true}
      )
      return res.status(200).json({
        success:true,
        message:"Category updated successfully",
        category:category
      })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
   
  }





  //for logout

  const adminLogout= async(req,res)=>{
    try{
        req.session.destroy()
         res.redirect("/admin")
    }catch(error){
      console.log(error.message)
    }
  }





  //for edit Brand
  const editBrand=async(req,res)=>{
    try {
      const {brandName,brandId}=req.body
      const brandImage =  req?.file?.filename;

      
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

        return res.redirect('/admin/brands')
      }


     
     
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }





  //for render edit brand

  const loadEditBrand=async(req,res)=>{
    try {
      
      const  id  = req.query.id
      
      const brandData=await Brands.findById(id)
      

      // if (!brandData) {
      //   return res.status(404).send('Brand not found');
      // }
      
      
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




  //for render customer List
  const customerList=async(req,res)=>{
    try {

      const page=parseInt(req.query.page) || 1
      const limit=4
      const skip=(page-1)* limit

      const userData=await User.find().skip(skip).limit(limit)

      const totalUsers=await User.countDocuments()

      const totalPages=Math.ceil(totalUsers/limit)
      

      return res.render('customerList',{
        userData,
        
        currentPage:page,
        totalPages
      })
    } catch (error) {
      console.lod(error.message)
    }
  }



// for customer status
  const customerStatus=async(req,res)=>{
    
    try {
      const {userId} =req.body

    const newUser=await User.findById(userId)
    
   const status=!newUser.is_blocked
   
    const user=await User.findByIdAndUpdate(userId,
      {$set:{is_blocked:status}},
      {new:true}
      
    )
    
      return res.status(200).json({
         success:true,
         messsage:"Customer status updated successfully",
         user:user
      })


    } catch (error) {
       return res.status(500).json({ success: false, message: 'Internal Server Error' });
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

    
      return res.status(200).json({
         success:true,
         messsage:"Brand status updated successfully",
         brand:brand
      })


    } catch (error) {
       return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }




  

  // for render edit category
  
  const loadEditCategory=async(req,res)=>{
    try {
      const {id}=req.query

      const categoryData=await Categories.findById(id)
      

      return res.render("editCategory",{categoryData})
    } catch (error) {
      
    }
  }



  //for edit category
  const editCategory=async(req,res)=>{

    const {categoryName,categoryDescription}=req.body

    console.log("name"categoryName)
    console.log("des"categoryName)
  }





 


  
  













module.exports={
  loadLogin,
  verifyLogin,
  loadDashboard,
  loadCategories,
  addCategories,
  loadbrands,
  addbrands,
  loadAddProduct,
  addProduct,
  loadProductList,
  loadProductDetails,
  loadEditProduct,
  removeProductImage,
  editProduct,
  productStatus,
  categoryStatus,
  adminLogout,
  editBrand,
  loadEditBrand,
  removeBrandImage,
  customerList,
  customerStatus,
  brandStatus,
  loadEditCategory,
  editCategory
  
}