var express = require("express");
const jwt = require('jsonwebtoken');
var router = express.Router();

const isAuthenticated = (req, res, next) => {
  // Check if the user is logged in
  const token = req.cookies.token;
  jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, decoded) => {
    if (err) {
      res.status(401).json({message:"Invalid Token"});

    } else {
      req.username = decoded.username;
      next();
    }
  });
};


module.exports = {isAuthenticated};