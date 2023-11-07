
var express = require("express");
var router = express.Router();
const jwt = require('jsonwebtoken')
const UserRegistration = require("../models/UserRegistration");
const {isAuthenticated} = require('../middlewares/authMiddleware');
const crypto = require("crypto")
const {sendEmail} = require("../utils/sendMail");

let algorithm = "sha256"



router.get("/get-login", (req, res)=>{
    res.send(`
    <form method="POST" action="/auth/login">
        <input type="text" placeholder="username" name="username">
        <input type="text" placeholder="password" name="password">
        <input type="submit">Submit</input>
    </form>
    `)
})


router.get("/get-register", (req, res)=>{
    res.send(`
    <form method="POST" action="/auth/register">
    <input type="text" placeholder="User name" name="username" required>
    <input type="email" placeholder="Email" name="email" required>
    <input type="password" placeholder="Password" name="password" required>
    <input type="password" placeholder="Confirm Password" name="confirmPassword" required>
    <input type="submit" value="Submit">
</form>

    `)
})

router.get("/get-reset", (req, res)=>{
    res.send(`
    <form method="POST" action="/auth/reset">
    <input type="text" placeholder="User name" name="username" required>
    <input type="email" placeholder="Email" name="email" required>
    <input type="password" placeholder="Password" name="password" required>
    <input type="password" placeholder="Confirm Password" name="confirmPassword" required>
    <input type="submit" value="Submit">
</form>

    `)
})


router.get("/get-otp", (req, res)=>{
    res.send(`
        <form method="POST" action="/auth/generate-otp">
        <input type="text" placeholder="User name" name="username" required>
        <input type="submit" value="Submit">
    </form>
    `)
})


router.get("/verify-otp", (req, res)=>{
    res.send(`
        <form method="POST" action="/auth/verify-otp">
        <input type="text" placeholder="User name" name="username" required>
        <input type="number" placeholder="OTP" name="otp" required>
        <input type="submit" value="Submit">
    </form>
    `)
})



router.post('/register', (req, res) => {
    // Perform authentication logic, e.g., validate credentials
    const { password, confirmPassword, username, email } = req.body;

    if (password == confirmPassword){
        const digest = crypto.createHash(algorithm).update(password).digest('hex')
        const newuser= new UserRegistration({
            username: username,
            email: email,
            password: digest,
            
          });
        
          newuser.save()
            .then((result)=>{
            res.redirect("/auth/login")
          })
          .catch((err) =>{
            console.log(err);
            res.send("Username Already exists")
          });
    }
    else{
        res.status(401).send("Both password are not same")
    }
    
    
});

router.get('/user', isAuthenticated, (req, res)=>{
    const token = req.cookies.token;
    const resObject = {}
    jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, decoded) => {
        if (err) {
          console.error('JWT verification failed:', err.message);
          res.status(401);
        } else {
          console.log('Decoded JWT payload:', decoded);
          resObject.username = decoded.username;
        }
      });
    res.send(resObject)
})


router.post('/generate-otp', async(req, res)=>{
    const { username } = req.body;
    
    const otp = Math.floor(Math.random() * (9999 - 0 + 1)) + 0;

    try {
        const result = await UserRegistration.findOneAndUpdate({"username":username}, {"otp":otp});
        sendEmail(result.email, {username:username, otp:otp})
    } catch (error) {
        res.redirect('/auth/get-register')
    }
    
    const interval = setInterval(async()=>{
        try{
            const updatedResult = await UserRegistration.findOneAndUpdate({"username":username}, {$unset:{"otp":otp}});
        }
        catch(e){
            console.log(e)
        }
    }, 60000)
    res.send(`OTP Sent Successfully`)
})

router.post('/verify-otp', async(req, res)=>{
    const { username, otp } = req.body;

    try{
        const result = await UserRegistration.findOne({"username":username});
        if(Number(otp) == Number(result.otp)){
            const updatedResult = await UserRegistration.findOneAndUpdate({"username":username}, {$unset:{"otp":result.otp}});
            const payload = {username: username}
            const token = jwt.sign(payload, process.env.JWT_ACCESS_KEY)
            res.cookie('token', token, { httpOnly: true });
            res.send("Login successful").status(200)
        }
    
        else{
            res.status(401).json({ message: 'Unauthorized' });
        }
    }
    catch(e){
        console.log(e);
        res.send("Not registered yet").redirect("/auth/get-register");
    }
    
})

router.post('/reset', isAuthenticated, async(req, res)=>{
    const { password, confirmPassword, email } = req.body;
    const username = req.username
    // Complete this Function for reseting the password of the account
    try{
        const result = await UserRegistration.findOne({"username":username});
        if (password == confirmPassword){
            const digest = crypto.createHash(algorithm).update(password).digest('hex')
            
            const result = await UserRegistration.findOneAndUpdate({"username":username}, {"email":email, "username":username, "password":digest});
            res.send("Password Updated successfully")
        }
        else{
            res.status(401).send("Both password are not same")
        }
    }
    catch(e){
        console.log(e);
        res.send("Not registered yet").redirect("/auth/get-register");
    }
    
})


router.post('/login', async(req, res) => {
    // Perform authentication logic, e.g., validate credentials
    const { username, password } = req.body;
    

    const digest = crypto.createHash(algorithm).update(password).digest('hex')
    const result = await UserRegistration.findOne({"username":username});

    try{
        if (String(username)==String(result.username) && String(digest)==String(result.password)){
            //  Added jwt token in login
            //  Not added in register
            //  Also not added in middleware
            const payload = {username: username}
            const token = jwt.sign(payload, process.env.JWT_ACCESS_KEY)
            res.cookie('token', token, { httpOnly: true });
            res.send("Login successful").status(200)
        }
    
        else{
            
            res.status(401).json({ message: 'Unauthorized' });
        }
    }
    catch(e){
        console.log(e);
        res.send("Not registered yet").redirect("/auth/get-register");
    }
    
});


router.get('/logout', isAuthenticated, (req, res) => {
    // Clear the token cookie
    
    res.clearCookie("token")
    res.send("logout successfully")
    res.status(200)
});




module.exports=router;