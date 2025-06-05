const Category = require("../models/categoryModel")
const Book = require("../models/bookModel")
const { default: mongoose } = require("mongoose");



exports.addCategory = async ( req ,res) =>
{
    try {
        const { category } = req.body
        if(!category)
        {
            return res.status(404).json({
              success : false ,
              message :"All Fileds Are Required."
            })
        }
        
        const isPresent = await Category.findOne({category :{ $regex: new RegExp(`^${category}`, "i") } })
        if(isPresent)
        {
          return res.status(400).json({
            success : false ,
            message :"Category is Already Exists.",
            category : isPresent
          })
        }
  
   const newCategory = await Category.create({category : category})

   return res.status(201).json({
    success : true ,
    message :"Category add successfully.",
    category : newCategory
  })
    } catch (error) {
        console.log(error)
      return res.status(500).json({
        success: false ,
        message : "Something went wrong.",
        error : error
      })
        
    }
}

exports.getCategoryDetails = async (req, res) => {
  try {


    let Category_On_Page = 6;
    const user = req.user ? req.user : null
   
    let totalCategorys;
    const categorys = await Category.find().countDocuments();
    totalCategorys = categorys;

    const page = +req.query.page || 1;
    const totalItems = +req.query.totalItems || Category_On_Page
    
    const category = await Category.find()
      .skip((page - 1) * totalItems)
      .limit(totalItems)
    
    // return res.render("book/category-details", {
    //   title: "Category Details Page",
    //   category: category,
    //   error: null,
    //   oldInput: req.query,
    //   currentPage: page,
    //   lastPage: Math.ceil(totalCategorys / totalItems),
    //   totalItems: totalItems,
    //   filter: false,
    //   sort: false,
    //   user : req.user,
    // });

     return res.status(200).json({
          success : true ,
          message : "Category details Fetched successfully.",
          data : category
        })
  } catch (err) {
    console.log(err);
  
    return res.status(500).json({
      success: false ,
      message : "Something went wrong.",
      error : err
    })
  }
}

exports.editCategory = async ( req ,res ) =>
{
    try {
        const {category} = req.body
        const edit = req.query.edit;
        const id = req.params.id;
        const isCategory = await Category.findById(id)

        if(!isCategory)
        {
          return res.status(404).json({
            success : false,
            message : "Category not found",
          })
        }
        
       
        if(!category ||!id)
        {
          return res.status(404).json({
            success : false,
            message : "Category is not definded."
          })
        }
        const isPresent = await Category.findOne({category :{ $regex: new RegExp(`^${category}$`, "i") } })
        
        if(isPresent)
        {
           
          return res.status(404).json({
            success : false,
            message : "Category is already present.",
            category : category
          })
        }

     const updated =  await Category.findByIdAndUpdate(id , { $set : { category : category }} , {new : true})
        
      
        return res.status(200).json({
          success : true,
          message : "Category is updated successfully.",
          category :updated
        })
   
    } catch (error) {

      console.log(error)
      return res.status(500).json({
        success: false ,
        message : "Something went wrong.",
        error : error
      })
    }
}

exports.deleteCategory = async ( req ,res ) =>
{
     try {
        const id = req.params.id;
        const isCategory = await Category.findById(id)

        if(!isCategory)
        {
          return res.status(404).json({
            success : false,
            message : "Category not found",
          })
        }
        const page = +req.body.page || 1;
        let Category_On_Page = 6;
        const totalItems = +req.query.totalItems || Category_On_Page
        const totalBooks = await Category.find().countDocuments();
        const category = await Category.find()
          .skip((page - 1) * totalItems)
          .limit(totalItems);
       
       const categoryInBook = await Book.findOne({category : new mongoose.Types.ObjectId(id)}) 
   
       if(categoryInBook)
       {

          return res.status(400).json({
            success : false,
            message : "Book is present of this Category, Cannot Delete it."
          })

       }

      const categoryDELTE= await Category.findByIdAndDelete(new mongoose.Types.ObjectId(id));

       return res.status(200).json({
        success : true,
        message : "Category is deleted successfully.",
        category :categoryDELTE
      })
      } catch (error) {
        console.log(error)
        return res.status(500).json({
          success: false ,
          message : "Something went wrong.",
          error : error
        })
      }
}

exports.categoryFilter = async (req, res, next) => {
  try {
    let {
      filter 
    } = req.query; 
     
    const page = +req.query.page || 1;
    const query = [];
    
    if (filter) {
      filter = filter.replace(/[^\w\s]/g, '')
        query.push({ category: { $regex: new RegExp(`${filter}`, "i") } });
    }else
    {
      query.push({})
    }
  
    const Category_On_Page = 6;
    let totalBooks = await Category.find().countDocuments();
   let totalItems = +req.query.totalItems || Category_On_Page
    const fcategory = await Category.find()
      .skip((page - 1).totalItems)
      .limit(totalItems) 

   
    
    totalBooks = await Category.countDocuments(
      query.length > 0 ? { $or: query } : {}
    );
  
    // console.log("query" , query ,totalBooks)
    const findcategory = await Category.find(query.length > 0 ? { $or: query } : {})
      .skip((page - 1) * totalItems)
      .limit(totalItems)
   return res.status(200).json({
    success : true ,
    message : "Category filterd successfully.",
    data : findcategory
   })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success : false ,
      message : "something went wrong",
      error : error
     })
    }
}

exports.sortBook = async (req, res) => {
  try {
    const field = req.query.field;
    const sortOrder = req.query.sortOrder;
    // console.log("sortOrder", sortOrder, "field", field);
    const Category_On_Page = 6;
    const page = +req.query.page || 1;
    const totalItems = +req.query.totalItems || Category_On_Page ;
    let totalBooks = await Category.countDocuments();
    
    const sort = {};
    sort[field] = sortOrder === "desc" ? -1 : 1;
    if(!sort){
      const category = await Category.find()
    
      .skip((page - 1) * totalItems)
      .limit(totalItems);

      return res.status(200).json({
        success : true ,
        message : "Category sorted successfully.",
        data : category
       })
    }
    const category = await Category.find()
      .sort(sort)
      .skip((page - 1) * totalItems)
      .limit(totalItems);

      return res.status(200).json({
        success : true ,
        message : "Category sorted successfully.",
        data : category
       })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success : false ,
      message : "something went wrong",
      error : error
     })
  }
}