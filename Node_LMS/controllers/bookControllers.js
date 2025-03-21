const { default: mongoose } = require("mongoose");
// import models
const Book = require("../models/bookModel");
const Record = require("../models/borrowRecordModel");

const { validationResult } = require("express-validator");

exports.getAddBook = async (req, res) => {
  try {
    return res.render("book/add-book", {
      title: "Add Book Page",
      error: null,
      edit: false,
      oldInput: {},
    });
  } catch (err) {
    console.log(err);
    return res.render("book/add-book", {
      title: "Add Book Page",
      error: "Something Went wrong...",
      edit: false,
      oldInput: {},
    });
  }
};

exports.getBookDetails = async (req, res) => {
  try {  
    const book = await Book.find().sort({ status: 1 }).sort({ title: 1 });

    return res.render("book/book-details", {
      title: "Book Details Page",
      book: book,
      error: null,
      oldInput: {},
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

exports.postAddBook = async (req, res) => {
  try {
    const { title, author, publicationDate, quantity, status } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("book/add-book", {
        title: "Add Book Page",
        error: errors.array()[0].msg,
        edit: false,
        oldInput: req.body,
      });
    }

    if (!title || !author || !publicationDate || !quantity || !status) {
      return res.render("book/add-book", {
        title: "Add Book Page",
        error: "All fields are required.",
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
      error: err.message,
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
    if (!book) {
      return res.render("book/add-book", {
        title: "Edit Book Page",
        error: "Book is not Found for edit.",
        book: {},
        edit: true,
      });
    }
    const oldInput = {
      title: book.title,
      author: book.author,
      publicationDate: book.publicationDate,
      quantity: book.quantity,
      status: book.status,
    };
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
      book: {},
      edit: true,
      oldInput: {},
    });
  }
};

// Edit Book in Database.....
exports.postEditBook = async (req, res) => {
  try {
    const {
      title,
      author,
      publicationDate,
      borrowedQuantity,
      quantity,
      status,
    } = req.body;
    const id = req.body.id;
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

    const book = await Book.findById(new mongoose.Types.ObjectId(id));
    const Allbook = await Book.find().sort({ status: 1 }).sort({ title: 1 });

    if (!book) {
      return res.render("book/add-book", {
        title: "Edit Book Page",
        error: "Book not found.",
        book: Allbook,
        edit: true,
        oldInput: {},
      });
    }

    if (!title || !author || !publicationDate || !quantity || !status) {
      return res.render("book/add-book", {
        title: "Edit Book Page",
        error: "All fields are required.",
        book: Allbook,
        edit: true,
        oldInput: req.body,
      });
    }

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

      const updatedBook = await Book.find()
        .sort({ status: 1 })
        .sort({ title: 1 });
      return res.render("book/book-details", {
        title: "Book Details Page",
        error: null,
        book: updatedBook,
        edit: true,
        oldInput: req.body,
      });
    }
    const updatedBook = await Book.find()
      .sort({ status: 1 })
      .sort({ title: 1 });

    if (quantity <= 0) {
      return res.render("book/book-details", {
        title: "Book Details Page",
        error: "Quantity cannot be 0 while updating status.",
        book: updatedBook,
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
          book: updatedBook,
          edit: true,
          oldInput: req.body,
        });
      }
    }
    if (quantity < book.borrowedQuantity) {
      return res.render("book/add-book", {
        title: "Edit Book Page",
        error: "Total quantity cannot be less than borrowed quantity.",
        book: book,
        edit: true,
        oldInput: req.body,
      });
    }

    const total =
      book.availableQuantity + book.borrowedQuantity + book.maintenanceQuantity;
    if (
      quantity < total &&
      book.borrowedQuantity < 0 &&
      book.maintenanceQuantity < 0
    ) {
      return res.render("book/add-book", {
        title: "Edit Book Page",
        error: "Total Book Quantity is not maintained.",
        book: book,
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

      const updatedBook = await Book.find()
        .sort({ status: 1 })
        .sort({ title: 1 });
      return res.render("book/book-details", {
        title: "Book Details Page",
        error: null,
        book: updatedBook,
        edit: true,
        oldInput: req.body,
      });
    } else {
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
        book: book,
        edit: true,
        oldInput: req.body,
      });
    }

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

    const updatedOneBook = await Book.findById(id);

    if (status === "available" && updatedOneBook.availableQuantity <= 0) {
      return res.render("book/add-book", {
        title: "Edit Book Page",
        error:
          "You cannot mark the status as available because all books are borrowed.",
        book: updatedOneBook,
        edit: true,
        oldInput: req.body,
      });
    }

    res.render("book/book-details", {
      title: "Book Details Page",
      error: null,
      book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
      edit: true,
      oldInput: req.body,
    });
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
    if (!currrecord) {
      await Book.findByIdAndDelete(id);
      return res.redirect("/book/book-details");
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

exports.bookFilter = async (req, res) => {
  try {
    const allBooks = await Book.find().sort({ status: 1 }).sort({ title: 1 });

    const {
      filterTitle,
      filterAuthor,
      filterPublicationDate,
      filterQuantity,
      filterAvailableQuantity,
      filterBorrowedQuantity,
      filterMaintenanceQuantity,
      filterStatus,
    } = req.body;
    const query = [];

    if (filterTitle) {
      query.push({ title: { $regex: new RegExp(`${filterTitle}`, "i") } });
    }
    if (filterAuthor) {
      query.push({ author: { $regex: new RegExp(`${filterAuthor}`, "i") } });
    }

    if (filterPublicationDate) {
      const pDate = new Date(filterPublicationDate);

      if (pDate == "Invalid Date") {
        return res.render("book/book-details", {
          title: "Book Details Page",
          book: allBooks,
          error: "Enter valid Publication Date",
          oldInput: req.body,
        });
      }
      query.push({ publicationDate: filterPublicationDate });
    }
    if (filterQuantity) {
      query.push({ quantity: filterQuantity });
    }
    if (filterAvailableQuantity) {
      query.push({ availableQuantity: filterAvailableQuantity });
    }
    if (filterBorrowedQuantity) {
      query.push({ borrowedQuantity: filterBorrowedQuantity });
    }
    if (filterMaintenanceQuantity) {
      query.push({ maintenanceQuantity: filterMaintenanceQuantity });
    }
    if (filterStatus) {
      query.push({ status: filterStatus });
    }

    const findBook = await Book.find(query.length > 0 ? { $and: query } : {})
      .sort({ status: 1 })
      .sort({ title: 1 });
    return res.render("book/book-details", {
      title: "Book Details Page",
      book: findBook,
      error: null,
      oldInput: req.body,
    });
  } catch (error) {
    console.log(error);
    return res.render("book/book-details", {
      title: "Book Details Page",
      book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
      error: error,
      oldInput: {},
    });
  }
};

exports.searchByPublictionDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (new Date(endDate) < new Date(startDate)) {
      return res.render("book/book-details", {
        title: "Book Details Page",
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        error: "Start Date is not Bigger than End Date on Publication Filter.",
        oldInput: req.body,
      });
    }
    const bookFinded = await Book.find({
      publicationDate: { $lte: new Date(endDate), $gte: new Date(startDate) },
    })
      .sort({ status: 1 })
      .sort({ title: 1 });

    return res.render("book/book-details", {
      title: "Book Details Page",
      book: bookFinded,
      error: null,
      oldInput: req.body,
    });
  } catch (error) {
    console.log(error);
    return res.render("book/book-details", {
      title: "Book Details Page",
      book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
      error: error,
      oldInput: {},
    });
  }
};

exports.filterByQuantity = async (req, res) => {
  try {
    const totalQuantity = req.body.totalQuantity;
    const filter = req.body.filter;
    if (totalQuantity < 0) {
      return res.render("book/book-details", {
        title: "Book Details Page",
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        error: "Quantity Sholud not be less than Zero",
        oldInput: req.body,
      });
    }
    let bookFinded = [];
    if (filter == "up") {
      bookFinded = await Book.find({
        quantity: { $gte: totalQuantity },
      });
    } else if (filter == "down") {
      bookFinded = await Book.find({
        quantity: { $lte: totalQuantity },
      });
    }

    return res.render("book/book-details", {
      title: "Book Details Page",
      book: bookFinded,
      error: null,
      oldInput: req.body,
    });
  } catch (error) {
    console.log(error);
    return res.render("book/book-details", {
      title: "Book Details Page",
      book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
      error: error,
      oldInput: {},
    });
  }
};

exports.filterByAvailable = async (req, res) => {
  try {
    const available = req.body.available;
    const filter = req.body.filter;

    if (available < 0) {
      return res.render("book/book-details", {
        title: "Book Details Page",
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        error: "Available Quantity Sholud not be less than Zero",
        oldInput: req.body,
      });
    }
    let bookFinded = [];
    if (filter == "up") {
      bookFinded = await Book.find({
        availableQuantity: { $gte: available },
      })
        .sort({ status: 1 })
        .sort({ title: 1 });
    } else if (filter == "down") {
      bookFinded = await Book.find({
        availableQuantity: { $lte: available },
      })
        .sort({ status: 1 })
        .sort({ title: 1 });
    }
    return res.render("book/book-details", {
      title: "Book Details Page",
      book: bookFinded,
      error: null,
      oldInput: req.body,
    });
  } catch (error) {
    console.log(error);
    return res.render("book/book-details", {
      title: "Book Details Page",
      book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
      error: error,
      oldInput: {},
    });
  }
};

exports.filterByBorrowed = async (req, res) => {
  try {
    const borrowed = req.body.borrowed;
    const filter = req.body.filter;

    if (borrowed < 0) {
      return res.render("book/book-details", {
        title: "Book Details Page",
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        error: "Maintanace Quantity Sholud not be less than Zero",
        oldInput: req.body,
      });
    }
    let bookFinded = [];
    if (filter == "up") {
      bookFinded = await Book.find({
        borrowedQuantity: { $gte: borrowed },
      })
        .sort({ status: 1 })
        .sort({ title: 1 });
    } else if (filter == "down") {
      bookFinded = await Book.find({
        borrowedQuantity: { $lte: borrowed },
      })
        .sort({ status: 1 })
        .sort({ title: 1 });
    }

    return res.render("book/book-details", {
      title: "Book Details Page",
      book: bookFinded,
      error: null,
      oldInput: req.body,
    });
  } catch (error) {
    console.log(error);
    return res.render("book/book-details", {
      title: "Book Details Page",
      book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
      error: error,
      oldInput: {},
    });
  }
};

exports.filterByMaintenance = async (req, res) => {
  try {
    const maintenance = req.body.maintenance;
    const filter = req.body.filter;

    if (maintenance < 0) {
      return res.render("book/book-details", {
        title: "Book Details Page",
        book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
        error: "Maintanace Quantity Sholud not be less than Zero",
        oldInput: req.body,
      });
    }
    let bookFinded = [];
    if (filter == "up") {
      bookFinded = await Book.find({
        maintenanceQuantity: { $gte: maintenance },
      })
        .sort({ status: 1 })
        .sort({ title: 1 });
    } else if (filter == "down") {
      bookFinded = await Book.find({
        maintenanceQuantity: { $lte: maintenance },
      })
        .sort({ status: 1 })
        .sort({ title: 1 });
    }

    return res.render("book/book-details", {
      title: "Book Details Page",
      book: bookFinded,
      error: null,
      oldInput: req.body,
    });
  } catch (error) {
    console.log(error);
    return res.render("book/book-details", {
      title: "Book Details Page",
      book: await Book.find().sort({ status: 1 }).sort({ title: 1 }),
      error: error,
      oldInput: {},
    });
  }
};
