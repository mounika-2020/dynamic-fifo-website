const express = require('express');
const routes = express.Router();

const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const user = require('../models/usermodel');
const benchsales = require('../models/usermodel');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
/*const mongourl = require('../config/mongokey');*/
require('./passport')(passport);


// using Bodyparser for getting form data
routes.use(bodyparser.urlencoded({ extended: true }));
// using cookie-parser and session
routes.use(cookieParser('secret'));
routes.use(session({
    secret: 'secret',
    maxAge: 3600000,
    resave: true,
    saveUninitialized: true,
}));
// using passport for authentications
routes.use(passport.initialize());
routes.use(passport.session());
// using flash for flash messages
routes.use(flash());

// MIDDLEWARES
// Global variable
routes.use(function (req, res, next) {
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});

const checkAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next();
    } else {
        res.redirect('/login');
    }
}

// Connecting To Database
// using Mongo Atlas as database
mongoose.connect('mongodb://mouni1997:mounika75@fifocluster-shard-00-00.dx5lk.mongodb.net:27017,fifocluster-shard-00-01.dx5lk.mongodb.net:27017,fifocluster-shard-00-02.dx5lk.mongodb.net:27017/Fifodb?ssl=true&replicaSet=atlas-h4enxu-shard-0&authSource=admin&retryWrites=true&w=majority' ,{
    useNewUrlParser: true, useUnifiedTopology: true,
}).then(() => console.log("Database Connected")
);


// ALL THE ROUTES
routes.get('/', (req, res) => {
    res.render('index');
})

routes.post('/register', (req, res) => {
     var { username,email,phone, password, cpass,cname,address,country } = req.body;
    var err;
    if (!username || !email || !phone || !password || !cpass || !cname || !address || !country) {
        err = "Please Fill All The Fields...";
        res.render('index', { 'err': err });
    }
    if (password != cpass) {
        err = "Passwords Don't Match";
        res.render('index', { 'err': err,  'username': username ,'email': email,'phone':phone,'cname':cname, 'address':address,'country':country});
    }
    if (typeof err == 'undefined') {
        user.findOne({ email: email }, function (err, data) {
            if (err) throw err;
            if (data) {
                console.log("User Exists");
                err = "User Already Exists With This Email...";
                res.render('index', { 'err': err, 'username': username,'email': email, 'phone':phone, 'cname':cname, 'address':address,'country':country });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        password = hash;
                        user({
                          username,
                            email,
                          password,
                          phone,
                          cname,
                          address,
                          country,
                        }).save((err, data) => {
                            if (err) throw err;
                            req.flash('success_message', "Registered Successfully.. Login To Continue..");
                            res.redirect('/login');
                        });
                    });
                });
            }
        });
    }
});


// Authentication Strategy
// ---------------


routes.get('/login', (req, res) => {
    res.render('login');
});

routes.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/success',
        failureFlash: true,
    })(req, res, next);
});

routes.get('/success', checkAuthenticated, (req, res) => {
    res.render('success', { 'user': req.user });
});


routes.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});



module.exports = routes;

//Benchsales conde


routes.get('/index-b', (req, res) => {
    res.render('index-b');
})

routes.post('/register-b', (req, res) => {
    var { username,email,cname,phone, password, cpass} = req.body;
    var err;
    if (!username || !email || !cname || !phone || !password || !cpass) {
        err = "Please Fill All The Fields...";
        res.render('index-b', { 'err': err });
    }
    if (password != cpass) {
        err = "Passwords Don't Match";
        res.render('index-b', { 'err': err,  'username': username ,'email': email, 'cname':cname, 'phone':phone});
    }
    if (typeof err == 'undefined') {
        benchsales.findOne({ email: email }, function (err, data) {
            if (err) throw err;
            if (data) {
                console.log("User Exists");
                err = "User Already Exists With This Email...";
                res.render('index', { 'err': err, 'username': username ,'email': email, 'cname':cname, 'phone':phone });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        password = hash;
                        user({
                          username,
                          email,
                          cname,
                          phone,
                          password,
                        }).save((err, data) => {
                            if (err) throw err;
                            req.flash('success_message', "Registered Successfully.. Login To Continue..");
                            res.redirect('/login');
                        });
                    });
                });
            }
        });
    }
});


// Authentication Strategy
// ---------------
