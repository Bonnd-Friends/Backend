const mongoose = require('mongoose');

// Define the email registration schema
const userRegistrationSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique:true
  },
  otp: {
    type: Number,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => {
        // Email validation logic
        // You can use a library like validator.js for more robust email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Invalid email address',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  profileId:{
    type: String,
    default:null
  },
  matchId:{
    type:String,
    default:null
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the EmailRegistration model using the schema
const UserRegistration = mongoose.model('users', userRegistrationSchema);

// Export the EmailRegistration model
module.exports = UserRegistration;
