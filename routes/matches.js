const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const UserRegistration = require('../models/UserRegistration');

router.post('/like', isAuthenticated, async (req, res) => {
  const { likedUsername } = req.body;
  const username = req.username;
  const userId = await UserRegistration.findOne({username:username})._id
  const likedId = await UserRegistration.findOne({username:likedUsername})._id
  console.log({username:userId}, {likedUsername:likedId})
  try {
    const result = await Match.findOneAndUpdate(
      { _id:userId },
      { $push: { likedUsers: likedId } }
    );

    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if it's a match
    const isMatch = await check_match(userId, likedId);

    if (isMatch) {
      // Both users like each other
      // Handle match logic
      await Match.findOneAndUpdate(
        { _id:userId },
        { $push: { matches: likedId } }
      );

      await Match.findOneAndUpdate(
        { _id: likedId },
        { $push: { matches: userId } }
      );

      // Remove users from likedUsers arrays and notificationArray
      await Match.updateMany(
        { _id: { $in: [userId, likedId] } },
        {
          $pull: { likedUsers: { $in: [userId, likedId] } },
        }
      );

      await Notification.updateMany(
        { _id: { $in: [userId, likedId] } },
        {
          $pull: { notificationArray: { $in: [userId, likedId] } },
        }
      )

      return res.status(200).json({ message: 'Matched!' });
    } else {
      // It's not a match, add User1 to User2's notification array
      await Notification.findOneAndUpdate(
        { _id: likedId },
        { $push: { notificationArray: `${username} liked you!` } }
      );

      return res.status(200).json({ message: 'Liked!' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Function to check if it's a match
async function check_match(userId, likedId) {
  try {
    const likedUser = await Match.findOne({ _id: likedId, likedUsers: userId });
    return !!likedUser;
  } catch (err) {
    return false;
  }
}

// Get Liked Users
router.get('/likedUsers',  async (req, res) => {
  const username = 'nishantthakre';

  try {
    // Find the user by their username
    const userId = await UserRegistration.findOne({username:username})._id
    const user = await Match.findOne({ username:userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the likedUsers array
    return res.status(200).json({ likedUsers: user.likedUsers });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get Matched Users
router.get('/matchedUsers', async (req, res) => {
  const username = 'nishantthakre';
  console.log(username)

  try {
    // Find the user by their username
    const userId = await UserRegistration.findOne({username:username})._id
    const user = await Match.findOne({ username:userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the matches array
    return res.status(200).json({ matches: user.matches });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get Notifications
router.get('/notifications', isAuthenticated, async (req, res) => {
  const username = req.username;

  try {
    // Find the user's notifications by their username
    const userId = await UserRegistration.findOne({username:username})._id
    const userNotifications = await Notification.findOne({ username:userId });

    if (!userNotifications) {
      return res.status(404).json({ error: 'User not found or no notifications available' });
    }

    // Return the notificationArray
    return res.status(200).json({ notifications: userNotifications.notificationArray });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
