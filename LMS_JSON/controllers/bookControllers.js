  const { default: mongoose } = require("mongoose");

const Book = require("../models/bookModel");
const Member = require("../models/memberModel")
const Record = require("../models/borrowRecordModel");
const Category =require("../models/categoryModel")
const { validationResult } = require("express-validator");


exports.getBookDetails = async (req, res) => {
  try {


    let Book_On_Page = 6;
    const user = req.user ? req.user : null
   
    let totalBooks;
    const books = await Book.find().countDocuments();
    totalBooks = books;

    const page = +req.query.page || 1;
    const totalItems = +req.query.totalItems || Book_On_Page
    console.log(totalItems)
    const book = await Book.find()
      .skip((page - 1) * totalItems)
      .limit(totalItems)
      .sort({ createdAt: -1 })
      .populate({path : "category" , select : "-books"});


    return res.status(200).json({
      success : true ,
      message : "Book details Fetched successfully.",
      data : book
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false ,
      message : "Something went wrong.",
      error : err
    })
  }
}; 

exports.getPrefferedBookDetails = async (req, res) => {
  try {


    let Book_On_Page = 6;
    const user = req.user ? req.user : null
   
    let totalBooks;
    const books = await Book.find().countDocuments();
    totalBooks = books;

    const page = +req.query.page || 1;
    const totalItems = +req.query.totalItems || Book_On_Page
    console.log(totalItems)
        const presentMember = await Member.findById(req.user._id)
           console.log("..",presentMember.prefferdCategories)
           const preferredBooks = [];
           const notpreferredBooks = [];
           
           const myBooks = await Book.find().populate("category");
           
           myBooks.forEach(book => {
             if (presentMember.prefferdCategories.includes(book.category?.category)) {
               preferredBooks.push(book);
             } else {
               notpreferredBooks.push(book._id);
             }
           });
          
           const bookss = await Book.find({ _id: { $in: preferredBooks } } ,)
             .skip((page - 1) * totalItems)  
             .limit(totalItems)
             .populate("category");
           
             return res.status(200).json({
              success : true ,
              message : "Book details Fetched successfully.",
              data : bookss
            })
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false ,
      message : "Something went wrong.",
      error : err
    })
  }
};

exports.postAddBook = async (req, res) => {
  try {
    const { title, author,category, publicationDate, quantity, status } = req.body;
    const errors = validationResult(req);
    const categorirs = await Category.find()
    if (!errors.isEmpty()) {
      return res.status(404).json({
        success : false ,
        message : "Error occured in Validation",
        error : errors.array()
      })
    }

    if (!title || !author || !publicationDate || !quantity || !status ||!category) {
      return res.status(404).json({
        success : false ,
        message : "All Fileds are required",
        
      })
    }

    const existingBook = await Book.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
      author: { $regex: new RegExp(`^${author}$`, "i") },
      category: category,
      publicationDate: publicationDate,
    }) .populate("category");
    // console.log("existing", existingBook);
    if (existingBook) {
      return res.status(404).json({
        success : false ,
        message : "This Book is already present in Library",
        
      })
    }
  const isCategory = await Category.findById(category)
    const book = new Book({
      title: title,
      author: author,
      category :category,
      quantity: quantity,
      publicationDate: publicationDate,
      status: status,
      availableQuantity: quantity,
    });

    const error = book.validateSync();

    if (error) {
      const errorMessages = [];

      for (const field in error.errors) {
        errorMessages.push(error.errors[field].message);
      }

      return res.status(404).json({
        success : false ,
        message : "Eeeror occure during add book",
        error : error
      })
    } 
    
    const updateCategory = await Category.findByIdAndUpdate(category , {
      $push : { books :book._id }
    } , {new : true})
    await book.save();
  
    return res.status(200).json({
      success :true ,
      message : 'Book add Successfully.',
      book : book
     })
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success :false ,
      message : 'Something Went Wrong..',
      error : err
     })
  }
};


// Edit Book in Database.....
exports.postEditBook = async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      publicationDate,
      borrowedQuantity,
      quantity,
      status,
    } = req.body;
   
    const categorirs = await Category.find();
    const id = req.params.id;
    const errors = validationResult(req);
    let Book_On_Page = 6;
    const totalItems = +req.query.totalItems || Book_On_Page;
    let totalBooks = await Book.find().countDocuments();
    const page = +req.query.page;

    if (!errors.isEmpty()) {
      return res.status(404).json({
        success : false ,
        message : "Error occured in Validation",
        error : errors.array[0].message
      })
    }

    const book = await Book.findById(new mongoose.Types.ObjectId(id));
    const Allbook = await Book.find()
      .skip((page - 1) * totalItems)
      .limit(totalItems)
      .populate("category");

    if (!book) {
      return res.status(404).json({
        success : false ,
        message : "Book is not found.",
       
      })
    }

    if (!title || !author || !publicationDate || !quantity || !status || !category) {
      return res.status(404).json({
        success : false ,
        message : "All fields Are required.",
       
      })
    }

    if (book.category.toString() !== category) {
      await Category.findByIdAndUpdate(book.category, {
        $pull: { books: book._id },
      });

      await Category.findByIdAndUpdate(category, {
        $push: { books: book._id },
      });
    }

    if (
      book.title !== title ||
      new Date(book.publicationDate).toISOString().split("T")[0] !== publicationDate ||
      book.author !== author || 
      book.category.toString() !== category
    ) {
     const updatedNewBook = await Book.findByIdAndUpdate(
        id,
        {
          $set: {
            title: title,
            author: author,
            category: category,
            quantity : quantity,
            publicationDate: publicationDate,
            availableQuantity : +(quantity - book.borrowedQuantity),
            status: status,
          },
        },
        { new: true }
      );

      const updatedBook = await Book.find()
        .skip(totalItems * (page - 1))
        .limit(totalItems)
        .populate("category");

        return res.status(200).json({
          success : true ,
          message : "Book updated 1 Successfully",
          ubook : updatedNewBook
        })  
    }

    const updatedBook = await Book.find()
      .skip(totalItems * (page - 1))
      .limit(totalItems)
      .populate("category");

    if (quantity <= 0) {
      return res.status(400).json({
        success : false ,
        message : "Quantity cannot be 0 while updating status.",
       
      })
    }

    const existing = await Book.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
      author: { $regex: new RegExp(`^${author}$`, "i") },
     
      publicationDate: new Date(publicationDate).toISOString().split("T")[0],
    });

    if (quantity < book.borrowedQuantity) {
    
      return res.status(400).json({
        success : false ,
        message : "Total quantity cannot be less than borrowed quantity.",
       
      })
    }

    const total = book.availableQuantity + book.borrowedQuantity + book.maintenanceQuantity;
    if (quantity < total && book.borrowedQuantity < 0 && book.maintenanceQuantity < 0) {
     
      return res.status(400).json({
        success : false ,
        message : "Total book quantity is not maintained.",
       
      })
    }

    if (status === "maintenance") {
      const updated = await Book.findByIdAndUpdate(
        id,
        {
          $set: {
            title: title || book.title,
            author: author || book.author,
            category: category || book.category,
            quantity: quantity || book.quantity,
            availableQuantity: 0,
            maintenanceQuantity: quantity - book.borrowedQuantity,
            borrowedQuantity: borrowedQuantity || book.borrowedQuantity,
            status: status || book.status,
          },
        },
        { new: true }
      );

      const updatedBook = await Book.find()
        .skip(totalItems * (page - 1))
        .limit(totalItems)
        .populate("category");

        
    } else {
      await Book.findByIdAndUpdate(
        id,
        {
          $set: {
            title: title || book.title,
            author: author || book.author,
            category: category || book.category,
            quantity: quantity || book.quantity,
            availableQuantity: book.quantity - book.borrowedQuantity,
            maintenanceQuantity: 0,
            status: status || book.status,
          },
        },
        { new: true }
      );
    }

    const pubDate = new Date(publicationDate).getTime();
    if (new Date() < pubDate) {
     
      return res.status(400).json({
        success : false ,
        message : "Publication date cannot be in the future.",
       
      })
    }

    await Book.findByIdAndUpdate(
      id,
      {
        $set: {
          title: title,
          author: author,
          category: category,
          quantity: quantity,
          availableQuantity: Math.max(0, quantity - book.borrowedQuantity),
          publicationDate: publicationDate,
          status: status,
        },
      },
      { new: true }
    );

    const updatedOneBook = await Book.findById(id);

    if (status === "available" && updatedOneBook.availableQuantity <= 0) {
      
      return res.status(400).json({
        success : false ,
        message : "You cannot mark the status as available because all books are borrowed.",
       
      })
    }
     
    return res.status(200).json({
      success :true ,
      message : 'Book updated 2 Successfully.',
      book : updatedOneBook
     })
    
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success :false ,
      message : 'Something Went Wrong..',
      error : err
     })
  }
};

// Delete Book in DB...
exports.deleteBook = async (req, res) => {
  try {
    const id = req.params.id;

    const deleteToBook = await Book.findById(id)
    if(!deleteToBook)
    {
      return res.status(404).json({
        success: false ,
        message : "Book not found",
      })
    }
    const page = +req.body.page || 1;
    let Book_On_Page = 6;
    const totalItems = +req.query.totalItems || Book_On_Page
    const totalBooks = await Book.find().countDocuments();
    const book = await Book.find() .populate("category")
      .skip((page - 1) * totalItems)
      .limit(totalItems);
    const currrecord = await Record.findOne({
      "book.bookId": new mongoose.Types.ObjectId(id),
    });
    if (!currrecord) {
      await Book.findByIdAndDelete(id);
     return res.status(200).json({
      success : true,
      message : "Book deleted successfully"
     })
    }
    const deleteBook = currrecord.book.find(
      (b) => b.bookId.toString() == id.toString()
    );

    if (currrecord && deleteBook.status != "returned") {
    
      return res.status(401).json({
        success : false,
        message : "This book is available in records so cannot delete it."
       })
    }

    if (currrecord.book.length > 1) {
      await Record.findOneAndUpdate(
        { "book.bookId": new mongoose.Types.ObjectId(id) },
        {
          $pull: { book: { bookId: id } },
        }
      );
    } else {
      await Record.findOneAndDelete({
        "book.bookId": new mongoose.Types.ObjectId(id),
      });
    }
    await Book.findByIdAndDelete(new mongoose.Types.ObjectId(id));
    return res.status(200).json({
      success : true,
      message : "Book deleted successfully."
     })
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success :false ,
      message : 'Something Went Wrong..',
      error : err
     })
  }
};

exports.bookFilter = async (req, res, next) => {
  try {
    let {
      filter 
    } = req.query; 
//  console.log("filter" , filter)
const page = +req.query.page || 1;
const query = [];

if (filter) {
  
  filter = filter.replace(/[^\w\s]/g, '')
      if(isNaN(filter))
      {
        query.push({ title: { $regex: new RegExp(`${filter}`, "i") } });
        query.push({ author: { $regex: new RegExp(`${filter}`, "i") } });
        query.push({ status: filter });
        //  query.push({ publicationDate: filter });
      }
      else
      {    
        filter = +filter
        query.push({ quantity: filter });
        query.push({ availableQuantity: filter });
        query.push({ borrowedQuantity: filter });
        query.push({ maintenanceQuantity: filter });
      }
    }
    else
    {
      query.push({})
    }
  
    const Book_On_Page = 6;
    let totalBooks = await Book.find().countDocuments();
   let totalItems = +req.query.totalItems || Book_On_Page
    const fBook = await Book.find()
      .skip((page - 1).totalItems)
      .limit(totalItems) .populate("category");    
    totalBooks = await Book.countDocuments(
      query.length > 0 ? { $or: query } : {}
    );
  
    // console.log("query" , query ,totalBooks)
    const findBook = await Book.find(query.length > 0 ? { $or: query } : {})
      .skip((page - 1) * totalItems)
      .limit(totalItems) .populate("category");

      return res.status(200).json({
        success :true ,
        message : "Filter Data Fatched Successfully.",
        data : findBook
      })
  } catch (error) {
    console.error(error);
  
    return res.status(500).json({
      success :false ,
      message : 'Something Went Wrong..',
      error : error
     })
  }
};

exports.sortBook = async (req, res) => {
  try {
    const field = req.query.field;
    const sortOrder = req.query.sortOrder;
    // if( !field || !sortOrder)
    // {
    //   return res.status(404).json({
    //     success : false , 
    //     message : "Credentials Not Found."
    //   })
    // }
    //  console.log("sortOrder", sortOrder, "field", field);
    const Book_On_Page = 6;
    const page = +req.query.page || 1;
    const totalItems = +req.query.totalItems || Book_On_Page ;
    let totalBooks = await Book.countDocuments();
    
    const sort = {};
    sort[field] = sortOrder === "desc" ? -1 : 1;
 if(sort)
 {
  const book = await Book.find()
      .sort(sort)
      .skip((page - 1) * totalItems)
      .limit(totalItems);

      return res.status(200).json({
        success :true ,
        message : "Sort Data Fatched Successfully.",
        data : book
      })
 } else
 {
  const book = await Book.find()
      .skip((page - 1) * totalItems)
      .limit(totalItems);
  return res.status(200).json({
    success :true ,
    message : "Sort Data Fatched Successfully.",
    data : book
  })
 }
    
  } catch (error) {
    console.error(error);
  
    return res.status(500).json({
      success :false ,
      message : 'Something Went Wrong..',
      error : error
     })
    }
};


exports.sortPrefferedBook = async (req, res) => {
  try {
    const field = req.query.field;
    const sortOrder = req.query.sortOrder;
    // console.log("sortOrder", sortOrder, "field", field);
    const Book_On_Page = 6;
    const page = +req.query.page || 1;
    const totalItems = +req.query.totalItems || Book_On_Page;
    let totalBooks = await Book.countDocuments({});

    const sort = {};
    sort[field] = sortOrder === "desc" ? -1 : 1;

    if(!sort)
    {
      const book = await Book.find()
        .skip((page - 1) * totalItems)
        .limit(totalItems)
        .populate("category");
  
        return res.status(200).json({
          success :true ,
          message : "Sort Data Fatched Successfully.",
          data : book})
    }

      const presentMember = await Member.findById(req.user._id);
    console.log("..", presentMember.prefferdCategories);
    const preferredBooks = [];
    const notpreferredBooks = [];

    const myBooks = await Book.find().populate("category");

    myBooks.forEach((book) => {
      if (presentMember.prefferdCategories.includes(book.category?.category)) {
        preferredBooks.push(book);
      } else {
        notpreferredBooks.push(book._id);
      }
    });

    // Paginate and fetch full book data
    const book = await Book.find({ _id: { $in: preferredBooks } })
    .sort(sort)
      .skip((page - 1) * totalItems)
      .limit(totalItems)
      .populate("category");

      return res.status(200).json({
        success :true ,
        message : "Sort Data Fatched Successfully.",
        data : book
      })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success :false ,
      message : 'Something Went Wrong..',
      error : error
     })
  }
};

exports.postAddBookrefferedBookFilter = async (req, res, next) => {
  try {
    let { filter, category } = req.query;
    //  console.log("filter" , filter)
    filter = filter.replace(/[^\w\s]/g, "");
    const page = +req.query.page || 1;
    const query = [];

    if (filter) {
      const category = await Category.find({
        category: { $regex: new RegExp(`${filter}`, "i") },
      });

      category.forEach((m) => {
        query.push({
          category: m._id,
        });
      });
      if (isNaN(filter)) {
        query.push({ title: { $regex: new RegExp(`${filter}`, "i") } });
        query.push({ author: { $regex: new RegExp(`${filter}`, "i") } });

        query.push({ "category.caegoty": filter });
        query.push({ status: filter });
      } else {
        filter = +filter;
        query.push({ quantity: filter });
        query.push({ availableQuantity: filter });
        query.push({ borrowedQuantity: filter });
        query.push({ maintenanceQuantity: filter });
      }
    }

    if (category) {
      const categoryData = await Category.find({ category: category });

      categoryData.forEach((m) => {
        query.push({
          category: m._id,
        });
      });
    }

    const Book_On_Page = 6;
    let totalBooks = await Book.find().countDocuments();
    let totalItems = +req.query.totalItems || Book_On_Page;
    

    totalBooks = await Book.countDocuments(
      query.length > 0 ? { $or: query } : {}
    );

    // console.log("query" , query ,totalBooks)
    // const findBook = await Book.find(query.length > 0 ? { $or: query } : {})
    //   .skip((page - 1) * totalItems)
    //   .limit(totalItems)
    //   .populate("category");
   
      
      const presentMember = await Member.findById(req.user._id);
    console.log("..", presentMember.prefferdCategories);
    const preferredBooks = [];
    const notpreferredBooks = [];

    const myBooks = await Book.find(query.length > 0 ? { $or: query } : {}).populate("category");

    myBooks.forEach((book) => {
      if (presentMember.prefferdCategories.includes(book.category?.category)) {
        preferredBooks.push(book);
      } else {
        notpreferredBooks.push(book._id);
      }
    });

    // Paginate and fetch full book data
    const findBook = await Book.find({ _id: { $in: preferredBooks } })  
      .skip((page - 1) * totalItems)
      .limit(totalItems)
      .populate("category");
       
      return res.status(200).json({
        success :true ,
        message : "Filter Data Fatched Successfully.",
        data : findBook
      })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success :false ,
      message : 'Something Went Wrong..',
      error : error
     })
  }
};