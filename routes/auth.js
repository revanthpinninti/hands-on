const router = require('express').Router();
const User = require('../models/User');
const { registerValidation, loginValidation } = require('../validation');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { deleteOne } = require('../models/User');
const uri = 'mongodb://localhost/logins';
const db = mongoose.createConnection(uri);
const url = require('url');
const nodemailer = require('nodemailer');

//User Registration
router.post('/register', async (req, res) => {

    //Validate the data before a user is added
    const {error} = registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);
   
    //check if user already exists
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).send('User already exists!');

    //Encrypt/hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Create a new user instance
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        gender: req.body.gender,
        city: req.body.city,
        country: req.body.country
    });

    try{
        //Save the user to database
        const savedUser = await user.save();

        res.send({
            user_id : savedUser._id,
            Name:savedUser.firstName,
            email: savedUser.email,
            city:savedUser.city,
            country: savedUser.country
        });
    } catch(err) {
        res.status(400).send(err);
    }
});

//User Login
router.post('/login', async (req, res) => {

    //Validate the user details
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    //Check if email exists
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Email incorrect');

    //Check if the password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send('password incorrect');

    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);

    await sendNotification(req.body.email, user.firstName, token);
    res.header('auth-token', token).send(`Email has been sent with token
                 ${token}`);
    //res.send(`${user.firstName} successfully logged in`);
});

//Get all users
router.get("/all", async (req, res) => {
    await User.find({}, {__v:0}, (err, data) => {
        if (err)
            res.status(400).send(err);
        else
            res.send(data);
    });
});

//Get all user from a specified city
router.get('/', async (req, res) => {
   // const cityName = url.parse(req.url, true).query;
  
    User.find({city: req.query.city}, (err, data) => {
        if(err)
            res.status(400).send(err);
        else
            res.send(data);
    });
});

//Get a particular user
router.get('/:email', (req, res) => {
   // res.send(req.params);
    const user = User.findOne({email: req.params.email});
    if(!user) return res.status(400).send('User doesn\'t exists');

 //   res.send(JSON.parse(user));
});

//Update user info
router.patch('/:email', async (req, res) => {
    try{
        const user = await User.updateOne(
            {email:req.params.email},
            { $set: {
                 city: req.body.city//,
                // country: req.body.country
            }});
            res.send(user);
    } catch(err) {
        res.status(400).send(err);
    }
});

//Delete user
router.delete('/:email', async (req, res) => {
    try{
        const deletedUser = await User.deleteOne({email: req.params.email});
        res.json(deletedUser);
    } catch(err) {
        res.status(400).send(err);
    }
});


async function sendNotification(email, name, token) {
    try{
        //create a reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: process.env.SENDER_SERVICE,
            auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASSWORD
        }
    });
       
        //Send an email with defined transport object
        const message = {
            from: process.env.SENDER_EMAIL,
            to: email,
            cc: "",
            bcc: "",
            subject: "Successfully logged into your account",
            text: `Hello ${name}, you have successfully logged into your account.
                    Your jwt token is ${token}`,
            html: ""
        };
        
        let info = await transporter.sendMail(message);
      //  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    
        console.log(`Email has been sent with id : ${info.messageId}`);
       
        } catch(err) {
            console.log(err);
        }
}
module.exports = router;