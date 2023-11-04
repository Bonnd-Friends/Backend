const mongoose = require('mongoose');

// Define the email registration schema
const emailRegistrationSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
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
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the EmailRegistration model using the schema
const EmailRegistration = mongoose.model('users', emailRegistrationSchema);

// Export the EmailRegistration model
module.exports = EmailRegistration;
