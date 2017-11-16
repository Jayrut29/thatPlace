const mongoose = require('mongoose');
const Store = mongoose.model('store');

exports.middleWAre = (req, res, next) => {
    req.name = 'TESTY SPOKE';
    res.cookie('name', 'WES IS COOL', {maxAge : 9000});
    next();
}

exports.homePage = (req, res) => {
    const wes = {name: "Jayrit", lastName: "patel", age:100};
    console.log(req.name);
    req.flash('success',`Succefully create now You are Prosoem.`);
    res.render('index');
}

exports.addStore = (req, res) => {
    res.render('editStore', {title : 'Add Store'});
}

exports.createStore = async (req, res) => {
    const store =  await (new Store(req.body)).save();
    req.flash('success',`Succefully create ${store.name}, now You are Prosoem.`);
    res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
    const store = await (Store.find());
    console.log(store,'====STORE===');
    res.render('stores', {title : 'THis is deliciuours', store : store});
}