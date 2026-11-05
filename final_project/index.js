const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const books = require('./router/booksdb.js');

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.get("/internal/books", (req, res) => {
  const { isbn, author, title } = req.query;

  if (isbn !== undefined) {
    if (typeof isbn !== "string") {
      return res.status(400).json({ message: "Invalid ISBN." });
    }

    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    return res.json(book);
  }

  if (author !== undefined) {
    if (typeof author !== "string") {
      return res.status(400).json({ message: "Invalid author." });
    }

    const matchingBooks = Object.keys(books)
      .map((bookIsbn) => books[bookIsbn])
      .filter((book) => book.author.toLowerCase() === author.toLowerCase());
    return res.json(matchingBooks);
  }

  if (title !== undefined) {
    if (typeof title !== "string") {
      return res.status(400).json({ message: "Invalid title." });
    }

    const matchingBooks = Object.keys(books)
      .map((bookIsbn) => books[bookIsbn])
      .filter((book) => book.title.toLowerCase() === title.toLowerCase());
    return res.json(matchingBooks);
  }

  return res.json(books);
});

app.use("/customer/auth/*", function auth(req,res,next){
  if (req.session.authorization) {
    const token = req.session.authorization.accessToken;

    jwt.verify(token, "access", (err, user) => {
      if (err) {
        return res.status(403).json({ message: "User not authenticated" });
      }

      req.user = user;
      next();
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
