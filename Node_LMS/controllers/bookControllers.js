const { default: mongoose } = require("mongoose");
// import models 
const Book = require("../models/bookModel");
const Record = require("../models/borrowRecordModel");

const { validationResult } = require("express-validator");

//  Add book Form Page....
exports.getAddBook = async (req, res) => {
  try {
    const book = await Book.find().sort({ title: 1 });
    return res.render("book/add-book", {
      title: "Add Book Page",
      error: null,
      book,
      edit: false,
      oldInput: {},
    });
  } catch (err) {
    console.log(err);
    return res.render("book/add-book", {
      title: "Add Book Page",
      error: "Something Went wrong...",
      book: await Book.find().sort({ title: 1 }),
      edit: false,
      oldInput: {},
    });
  }
};
// All Book Details Page.....
exports.getBookDetails = async (req, res) => {
  try {
    const book = await Book.find().sort({ status: 1 }).sort({ title: 1 });

    return res.render("book/book-details", {
      title: "Book Details Page",
      book: book,
      error: null,
    });
  } catch (err) {
    console.log(err);
    return res.render("book/book-details", {
      title: "Book Details Page",
      error: "Something Went wrong...",
      book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
    });
  }
};
//  Add Book in Database......
exports.postAddBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("book/add-book", {
        title: "Add Book Page",
        error: errors.array()[0].msg,
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        edit: false,
        oldInput: req.body,
      });
    }
    const {
      title,
      author,
      publicationDate,
      quantity,
      status,
    } = req.body;
    const Allbook = await Book.find().sort({ status: 1 }).sort({ title: 1 });
    if (!title || !author || !publicationDate || !quantity || !status) {
      return res.render("book/add-book", {
        title: "Add Book Page",
        error: "All fields are required.",
        book: Allbook,
        edit: false,
        oldInput: req.body,
      });
    }

    const existingBook = await Book.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
      author: { $regex: new RegExp(`^${author}$`, "i") },
      publicationDate: publicationDate,
    });
    // console.log("existing", existingBook);
    if (existingBook) {
      return res.render("book/add-book", {
        title: "Add Book Page",
        error: "This Book is already exist in Library",
        book: Allbook,
        edit: false,
        oldInput: req.body,
      });
    }

    const book = new Book({
      title: title,
      author: author,
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

      return res.render("book/add-book", {
        title: "Add Book Page",
        error: error,
        book: Allbook,
        edit: false,
        oldInput: req.body,
      });
    }
    await book.save();

    res.redirect("/book/book-details");
  } catch (err) {
    console.log(err);
    return res.render("book/book-details", {
      title: "Book Details Page",
      error: "Something Went wrong...",
      book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
      edit: false,
      oldInput: req.body,
    });
  }
};

// Edit Book Page.....
exports.getEditBook = async (req, res) => {
  try {
    const edit = req.query.edit;
    const id = req.params.id;
    
    const book = await Book.findOne({ _id: id });
    const oldInput = {
      title: book.title,
      author: book.author,
      quantity: book.quantity,
      publicationDate: book.publicationDate,
      status: book.status,
    };

    //  console.log("book" , book)
    return res.render("book/add-book", {
      title: "Edit Book Page",
      error: null,
      book: book,
      edit: edit,
      oldInput: oldInput,
    });
  } catch (err) {
    console.log(err);
    return res.render("book/add-book", {
      title: "Edit Book Page",
      error: "Something Went wrong...",
      book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
      edit: true,
      oldInput: oldInput,
    });
  }
};

// Edit Book in Database.....
exports.postEditBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.render("book/add-book", {
        title: "Edit Book Page",
        error: errors.array()[0].msg,
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        edit: true,
        oldInput: req.body,
      });
    }

    const {
      title,
      author,
      publicationDate,
      borrowedQuantity,
      quantity,
      status,
      id,
    } = req.body;

    if (!title || !author || !publicationDate || !quantity || !status || !id) {
      return res.render("book/add-book", {
        title: "Edit Book Page",
        error: "All fields are required.",
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        edit: true,
        oldInput: req.body,
      });
    }

    const book = await Book.findById(new mongoose.Types.ObjectId(id));

    if (!book) {
      return res.render("book/add-book", {
        title:"Edit Book Page",
        error: "Book not found.",
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        edit: true,
        oldInput: {},
      });
    }

    // Do not Changes in Title, Author, or Publication Date
    if (
      book.title !== title ||
      new Date(book.publicationDate).toISOString().split("T")[0] !==
        publicationDate ||
      book.author !== author
    ) {
      await Book.findByIdAndUpdate(
        id,
        {
          $set: {
            title: title,
            author: author,
            publicationDate: publicationDate,
            status: status,
          },
        },
        { new: true }
      );

      return res.render("book/book-details", {
        title: "Book Details Page",
        error: null,
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        edit: true,
        oldInput: req.body,
      });
    }

   
    if (quantity <= 0) {
      return res.render("book/book-details", {
        title: "Book Details Page",
        error: "Quantity cannot be 0 while updating status.",
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        edit: true,
        oldInput: req.body,
      });
    }

   
    const existing = await Book.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
      author: { $regex: new RegExp(`^${author}$`, "i") },
      publicationDate: new Date(publicationDate).toISOString().split("T")[0],
    });

    if (existing) {
      if (quantity === book.quantity && status === book.status) {
        return res.render("book/book-details", {
          title: "Edit Book Page",
          error: "This book already exists with the same details.",
          book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
          edit: true,
          oldInput: req.body,
        });
      }
    }
    const total =
      book.availableQuantity + book.borrowedQuantity + book.maintenanceQuantity;
    if (
      quantity < total &&
      book.borrowedQuantity != 0 &&
      book.maintenanceQuantity != 0
    ) {
      return res.render("book/add-book", {
        title: "Edit Book Page",
        error: "Total Book Quantity is not maintained.",
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        edit: true,
        oldInput: req.body,
      });
    }
    if (status === "maintenance") {
      const updated = await Book.findByIdAndUpdate(
        id,
        {
          $set: {
            title: title || book.title,
            author: author || book.author,
            quantity: quantity || book.quantity,
            availableQuantity: 0,
            maintenanceQuantity: quantity - book.borrowedQuantity,
            borrowedQuantity: borrowedQuantity || book.borrowedQuantity,
            status: status || book.status,
          },
        },
        { new: true }
      );

      return res.render("book/book-details", {
        title: "Book Details Page",
        error: null,
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        edit: true,
        oldInput: req.body,
      });
    } else {
      // console.log("Status", status, book.quantity - book.borrowedQuantity);

      await Book.findByIdAndUpdate(
        id,
        {
          $set: {
            title: title || book.title,
            author: author || book.author,
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
      return res.render("book/add-book", {
        title: "Edit Book Page",
        error: "Publication date cannot be in the future.",
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        edit: true,
        oldInput: req.body,
      });
    }

    // last Update
    await Book.findByIdAndUpdate(
      id,
      {
        $set: {
          title: title,
          author: author,
          quantity: quantity,
          availableQuantity: Math.max(0, quantity - book.borrowedQuantity),
          publicationDate: publicationDate,
          status: status,
        },
      },
      { new: true }
    );

    if (book.quantity != total) {
      const total =
        book.availableQuantity +
        book.borrowedQuantity +
        book.maintenanceQuantity;
      return res.render("book/add-book", {
        title: "Edit Book Page",
        error: "Total Book Quantity is not maintained.",
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        edit: true,
        oldInput: req.body,
      });
    }
     
    if(status == 'available')
    {
      if (book.availableQuantity <= 0) {
        return res.render("book/add-book", {
          title: "Edit Book Page",
          error: "You cannot mark Status availabe because of all books are borrowed.",
          book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
          edit: true,
          oldInput: req.body,
        });
      }
    }
    if (book.quantity <= 0) {
      await Book.findByIdAndUpdate(
        id,
        { $set: { status: "borrowed" } },
        { new: true }
      );
    } else {
      await Book.findByIdAndUpdate(
        id,
        { $set: { status: "available" } },
        { new: true }
      );
    }

    res.redirect("/book/book-details");
  } catch (err) {
    console.log(err);
    return res.render("book/book-details", {
      title: "Edit Book Page",
      error: "Something went wrong...",
      book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
      edit: true,
      oldInput: {},
    });
  }
};

// Delete Book in DB...
exports.deleteBook = async (req, res) => {
  try {
    const id = req.params.id;

    const currrecord = await Record.findOne({
      "book.bookId": new mongoose.Types.ObjectId(id),
    }); 
     if(!currrecord)
     {
       await Book.findByIdAndDelete(id)
       return res.redirect("/book/book-details")
     }
    const deleteBook = currrecord.book.find(
      (b) => b.bookId.toString() == id.toString()
    );

    if (currrecord && deleteBook.status != "returned") {
      return res.render("book/book-details", {
        title: "Book details Page",
        error: "This book is available in records so cannot delete it.",
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        edit: false,
        oldInput: {},
      });
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
    res.redirect("/book/book-details");
  } catch (err) {
    console.log(err);
    return res.render("book/book-details", {
      title: "Book Details Page",
      error: "Something Went wrong...",
      book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
      edit: false,
    });
  }
};
