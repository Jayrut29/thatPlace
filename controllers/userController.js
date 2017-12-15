const mongoose = require('mongoose');


exports.loginForm = (req, res) => {
    res.render('user',{title: 'User'});
}

exports.registerForm = (req, res) => {
    res.render('register', {title: 'Register'});
}

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'your name must apply').notEmpty();
    req.checkBody('email', 'your Email must apply').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password','You must enter Password').notEmpty();
    req.checkBody('confirm-password','You must Enter Confirm password Password').notEmpty();
    req.checkBody('confirm-password','You must match with Password').equals(req.body.password);

    const errors = req.validationErrors();
    
    if (errors){
        req.flash('error', errors.map(err => err.msg));
        res.render('register', {title: 'Register', body: req.body, flashes: req.flash() });        
        return;
    }
    next();
}