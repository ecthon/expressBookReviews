const express = require('express');
const axios = require("axios");
const books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const BOOKS_API_URL = "http://127.0.0.1:5000/internal/books";

const forwardApiError = (error, res, next) => {
  if (axios.isAxiosError(error) && error.response) {
    return res.status(error.response.status).json(error.response.data);
  }

  return next(error);
};


public_users.post("/register", (req,res) => {
  const { username, password } = req.body || {};

  if (typeof username !== "string" || !username.trim() ||
      typeof password !== "string" || !password.trim()) {
    return res.status(404).json({ message: "Unable to register user." });
  }

  if (!isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res, next) {
  try {
    const response = await axios.get(BOOKS_API_URL);
    return res.type("json").send(JSON.stringify(response.data, null, 2));
  } catch (error) {
    return forwardApiError(error, res, next);
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res, next) {
  try {
    const response = await axios.get(BOOKS_API_URL, {
      params: { isbn: req.params.isbn }
    });
    return res.json(response.data);
  } catch (error) {
    return forwardApiError(error, res, next);
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res, next) {
  try {
    const response = await axios.get(BOOKS_API_URL, {
      params: { author: req.params.author }
    });
    return res.json(response.data);
  } catch (error) {
    return forwardApiError(error, res, next);
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res, next) {
  try {
    const response = await axios.get(BOOKS_API_URL, {
      params: { title: req.params.title }
    });
    return res.json(response.data);
  } catch (error) {
    return forwardApiError(error, res, next);
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  return res.json(book.reviews);
});

module.exports.general = public_users;
