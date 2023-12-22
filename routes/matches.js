const express = require('express');
const router = express.Router();
const Match = require('../models/matchesData');
const Notification = require('../models/notification');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.post('/like', isAuthenticated, async (req, res) => {
  const { likedUsername } = req.body;
  const username = req.username;
  console.log(username, likedUsername)
  try {
    const result = await Match.findOneAndUpdate(
      { username },
      { $push: { likedUsers: likedUsername } }
    );

    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if it's a match
    const isMatch = await check_match(username, likedUsername);

    if (isMatch) {
      // Both users like each other
      // Handle match logic
      await Match.findOneAndUpdate(
        { username },
        { $push: { matches: likedUsername } }
      );

      await Match.findOneAndUpdate(
        { username: likedUsername },
        { $push: { matches: username } }
      );

      // Remove users from likedUsers arrays and notificationArray
      await Match.updateMany(
        { username: { $in: [username, likedUsername] } },
        {
          $pull: { likedUsers: { $in: [username, likedUsername] } },
        }
      );

      await Notification.updateMany(
        { username: { $in: [username, likedUsername] } },
        {
          $pull: { notificationArray: { $in: [username, likedUsername] } },
        }
      )

      return res.status(200).json({ message: 'Matched!' });
    } else {
      // It's not a match, add User1 to User2's notification array
      await Notification.findOneAndUpdate(
        { username: likedUsername },
        { $push: { notificationArray: `${username} liked you!` } }
      );

      return res.status(200).json({ message: 'Liked!' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Function to check if it's a match
async function check_match(username, likedUsername) {
  try {
    const likedUser = await Match.findOne({ username: likedUsername, likedUsers: username });
    return !!likedUser;
  } catch (err) {
    return false;
  }
}

// Get Liked Users
router.get('/likedUsers', isAuthenticated, async (req, res) => {
  const username = req.username;

  try {
    // Find the user by their username
    const user = await Match.findOne({ username });

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
router.get('/matchedUsers', isAuthenticated, async (req, res) => {
  const username = req.username;
  console.log(username)

  try {
    // Find the user by their username
    const user = await Match.findOne({ username });

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
    const userNotifications = await Notification.findOne({ username });

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