
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  username: String,
  notificationArray: [String], 
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;