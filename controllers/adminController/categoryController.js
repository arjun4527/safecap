// const User=require("../../models/user-model")
// const bcrypt=require("bcrypt")
const Categories=require("../../models/category-model")
// const Brands=require("../../models/brand-model")
// const AddProducts = require("../../models/product-model")
// const path=require('path')
// const { log } = require("console")
// const sharp = require('sharp');



//for render categories.ejs 
const loadCategories=async(req,res)=>{
  try {
    const added=req.session.categoryAdded
    const categoryExist= req.session.categoryExist

    const updateCategory=req.session.updateCategory
      req.session.updateCategory=null

    req.session.categoryAdded=null
    req.session.categoryExist=null

    const categoriesData = await Categories.find({})
  
    return res.render("categories",{categoriesData:categoriesData,added,categoryExist,updateCategory})
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





// for render edit category
  
const loadEditCategory=async(req,res)=>{
  try {
    const {id}=req.query

    const categoryData=await Categories.findById(id)


    return res.render("editCategory",{categoryData})
  } catch (error) {
    console.log("loadEDitCategory",error.message)
  }
}




//for edit category
const editCategory=async(req,res)=>{

  try {
    
    const {categoryName,categoryDescription,categoryId} =req.body

    
    const isCategoryExist = await Categories.findOne({
      name: categoryName,        
      _id: { $ne: categoryId }   
    });

    if (isCategoryExist) {
      
      const categoryExist = "Category name is already exist, choose another one";

      
      return res.render("editCategory", {
          categoryData: {
              _id: categoryId, 
              name: categoryName, 
              description: categoryDescription 
          },
          categoryExist 
      });
    }else{
      if(categoryName || categoryDescription){

        const updatedCategory=await Categories.findByIdAndUpdate(
          categoryId,
          {
            $set:{
              name:categoryName,
              description:categoryDescription
            }
          },
          {new:true}
        )
        req.session.updateCategory="Updation Successfully Completed"
        return res.redirect('/admin/categories')
      }
    }

  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}



module.exports={
  loadCategories,
  addCategories,
  categoryStatus,
  loadEditCategory,
  editCategory
}