
var express = require("express");
var router = express.Router();
const jwt = require('jsonwebtoken')
const {isAuthenticated} = require('../middlewares/authMiddleware');
const Profile = require("../models/Profile");

router.get('/', isAuthenticated, async (req, res) => {
    try {
      const username = req.username;
  
      // Fetch all user registrations from the database
      const allUsers = await Profile.find({});

      const otherUsers = allUsers.filter(user => user.username !== username);
  
      // Generate a random subset of user registrations for the user's feed
      const randomUsers = generateRandomSubset(otherUsers, 3); // Change 3 to the desired number of users
  
      res.json(randomUsers);
    } catch (error) {
      console.error('Error fetching random users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Function to generate a random subset of an array
  function generateRandomSubset(array, count) {
    const shuffledArray = array.sort(() => Math.random() - 0.5);
    return shuffledArray.slice(0, count);
  }

module.exports=router;
