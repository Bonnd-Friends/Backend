var express = require("express");
const jwt = require('jsonwebtoken');
var router = express.Router();

const isAuthenticated = (req, res, next) => {
    // Check if the user is logged in
    const token = req.cookies.token;
    jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, decoded) => {
      if (err) {
        console.error('JWT verification failed:', err.message);
        res.status(401);
        
      } else {
        console.log('Decoded JWT payload:', decoded);
        req.user = decoded;
        next();
      }
    });
  };
  
module.exports = isAuthenticated;