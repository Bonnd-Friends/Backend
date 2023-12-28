
const express = require('express')
var cors = require('cors')
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
var mongoose = require('mongoose');


require('dotenv').config()
const app = express()
const port = process.env.PORT


app.use(cors({origin: 'http://localhost:5173',credentials: true}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());

const CONNECTION_URL = process.env.MONGODB_URL

mongoose.connect(CONNECTION_URL).then((result) => {
  console.log("connected");
})
  .catch((err) => console.log(err));





//   Model declarations
const UserRegistration = require("./models/UserRegistration");

//   Middleware declarations
const {isAuthenticated} = require('./middlewares/authMiddleware');


//    Routes declarations
const login = require("./routes/login");
const profile = require("./routes/profile");
const matches = require("./routes/matches");
const feed = require("./routes/feed");




app.use('/auth', login);
app.use('/profile', profile);
app.use('/matches', matches);
app.use('/feed', feed)



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
