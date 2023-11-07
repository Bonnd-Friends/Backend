const mongoose = require('mongoose');

// Define the profile schema
const profileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    dob: {
        type: Date,
    },
    is_active: {
        type: Boolean,
        default: false,
    },
    location: {
        type: String,
    },
    image_url: {
        type: Array,
    },
    insta_id: {
        type: String,
    },
    tags: {
        type: Object,
    },
    last_login: {
        type: Date,
    },
    email: {
        type: String,
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
    phone_number: {
        type: String,
        validate: {
            validator: function (v) {
                return /^[0-9]{10}/.test(v);
            },
            message: '{VALUE} is not a valid 10 digit number!',
        },
        required: true,
    },
    gender: {
        type: String,
    }
});

// Create a virtual field to calculate age
profileSchema.virtual('age').get(function () {
    if (this.dob) {
        const today = new Date();
        const birthDate = new Date(this.dob);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    return undefined;
});

// Create the Profile model using the schema
const Profile = mongoose.model('Profile', profileSchema);

// Export the Profile model
module.exports = Profile;
