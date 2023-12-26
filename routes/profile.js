var express = require("express");
var router = express.Router();

const { isAuthenticated } = require('../middlewares/authMiddleware');
const Profile = require("../models/Profile");
const UserRegistration = require("../models/UserRegistration");



router.get('/', isAuthenticated, async(req, res) => {
    const username = req.username   
    try{
        const user = await UserRegistration.findOne({username:username})
        const profile = await Profile.findOne({ _id: user.profileId })
        res.json(profile).sendStatus(200)
    }
    catch(e){
        res.json({message:"Error finding profile"}).status(404)
    }

})



router.post('/create', isAuthenticated, async (req, res) => {
    const username = req.username
    const body = req.body

    try {
        const newUser = new Profile({
            username: username,
            name: body.name,
            description: body.description?body.description:"",
            gender: body.gender?body.gender:"",
            insta_id: body.insta_id?body.insta_id:"",
            email: body.email?body.email:"",
            phone_number: body.phone_number?body.phone_number:"",
            location: body.location?body.location:"",
            dob: body.dob?body.dob:""
            
        });
        const savedUser = await newUser.save();
        const user = await UserRegistration.findOneAndUpdate({username:username}, {profileId:savedUser._id})
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


router.post('/update', isAuthenticated, async(req, res) => {
    const username = req.username
    const body = req.body

    

    try {
        const user = await UserRegistration.findOne({username:username})
        const result = await Profile.findOne({_id: user.profileId})
        const newUser = {
            name: body.name?body.name:result.name,
            description: body.description?body.description:result.description,
            gender: body.gender?body.gender:result.gender,
            insta_id: body.insta_id?body.insta_id:result.insta_id,
            email: body.email?body.email:result.email,
            phone_number: body.phone_number?body.phone_number:result.phone_number,
            location: body.location?body.location:result.location,
            dob: body.dob?body.dob:result.dob
            
        };
        const profile = await Profile.findOneAndUpdate({ _id: user.profileId }, newUser)
        
        res.status(201).json({message: "Profile Updated Successfully"});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;