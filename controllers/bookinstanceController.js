const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const debug = require("debug")("bookinstance");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();
  res.render("book_instance_list", {
    title: "Book Instance List",
    bookinstance_list: allBookInstances,
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();
  if (bookInstance === null) {
    debug(`id not found on getting details:${req.params.id}`);
    const err = new Error("Book instance not found");
    err.status = 404;
    next(err);
  }

  res.render("book_instance_detail", {
    title: "Book Instance Detail",
    bookinstance: bookInstance,
  });
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, { title: 1 }).sort({ title: 1 }).exec();
  res.render("bookinstance_form", {
    title: "Create Book Instance",
    book_list: allBooks,
  });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });
    if (!errors.isEmpty()) {
      const allBooks = await Book.find({}, { title: 1 })
        .sort({ title: 1 })
        .exec();
      res.render("bookinstance_form", {
        title: "Create Book Instance",
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        bookinstance: bookInstance,
        errors: errors.array(),
      });
      return;
    }
    await bookInstance.save();
    res.redirect(bookInstance.url);
  }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).populate(
    "book"
  );
  if (bookInstance === null) {
    debug(`id not found on delete: ${req.params.id}`);
    res.redirect("/catalog/bookinstances");
    return;
  }
  res.render("bookinstance_delete", {
    title: "Delete Book Instance",
    bookinstance: bookInstance,
  });
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  await BookInstance.findByIdAndDelete(req.body.bookinstanceid);
  res.redirect("/catalog/bookinstances");
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const [bookInstance, allBooks] = await Promise.all([
    BookInstance.findById(req.params.id).exec(),
    Book.find({}, { title: 1 }).sort({ title: 1 }).exec(),
  ]);
  if (bookInstance === null) {
    debug(`id not found on update: ${req.params.id}`);
    const err = new Error("Book Instance not found");
    err.status = 404;
    return next(err);
  }
  res.render("bookinstance_form", {
    title: "Update Book Instance",
    bookinstance: bookInstance,
    book_list: allBooks,
    selected_book: bookInstance.book._id,
  });
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  body("book", "Book must not be empty").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("status", "Status cannot be empty").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const bookInstance = new BookInstance({
      _id: req.params.id,
      book: req.body.book,
      imprint: req.body.imprint,
      due_back: req.body.due_back,
      status: req.body.status,
    });
    if (!errors.isEmpty()) {
      const allBooks = await Book.find({}, { title: 1 })
        .sort({ title: 1 })
        .exec();
      res.render("bookinstance_form", {
        title: "Update Book Instance",
        bookinstance: bookInstance,
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
      });
      return;
    }
    const updatedBookInstance = await BookInstance.findByIdAndUpdate(
      req.params.id,
      bookInstance
    );
    res.redirect(updatedBookInstance.url);
  }),
];
