const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('user');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail')

exports.login = passport.authenticate('local',{
    successRedirect: '/',
    failureFlash: 'Failed Loging',
    failureRedirect: '/login',
    successFlash: 'You are now logged In'
}); 


exports.logout = (req, res) => {
    req.logout();
    req.flash('success','You are successdully logged out');
    res.redirect('/');
};


exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
        return;
    }
    req.flash('error','Oops! You must be logged in');
    res.redirect('/login');
};

exports.forgot = async(req, res) => {
    const user = await User.findOne({ email : req.body.email });
    if(!user) {
        req.flash('error','User is not available');
        return res.redirect('/login');
    }
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `https://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

    await mail.send({
        user,
        subject: 'Password Reset Request',
        resetUrl,
        filename: 'password-reset'
    });

    req.flash('success','Reset password email has been sent it to you');

    res.redirect('/login');
}

exports.reset = async(req, res) => {
    const user = await User.findOne({
        resetPasswordToken : req.params.token,
        resetPasswordExpires : { $gt: Date.now() }
    });
    if(!user) {
        req.flash('error', 'TOken is expired or user is not valid');
        return res.redirect('/login');
    }
    res.render('reset', {title: 'reset password'})
}

exports.confirmPassword = (req, res, next) => {
    if(req.body.password === req.body['confirm-password']) {
        next();
        return;
    }
    req.flash('error', 'Password Dont match');
    res.redirect('back')
}

exports.update = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken : req.params.token,
        resetPasswordExpires : { $gt: Date.now() }
    });
    if(!user) {
        req.flash('error', 'TOken is expired or user is not valid');
        return res.redirect('/login');
    }
    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser);
    req.flash('success', '💃 Nice! Your password has been reset! You are now logged in!');
    res.redirect('/');
}