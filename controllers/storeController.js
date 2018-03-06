const mongoose = require('mongoose');
const Store = mongoose.model('store');
const multer  = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');


const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto) {
            next(null, true);
        } else {
            next({ message: 'That filetype isn\'t allowed!' }, false);
        }
    }
};

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
exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    // check if there is no new file to resize
    if (!req.file) {
        next(); // skip to the next middleware
        return;
    }
    const extention = req.file.mimetype.split('/')[1];
    req.body.photo  = `${uuid.v4()}.${extention}`;

    const photo = await jimp.read(req.file.buffer);
    await photo.resize(400,400);
    await photo.write(`./public/uploads/${req.body.photo}`);
    // once we have written the photo to our filesystem, keep going!
    next();
};
exports.createStore = async (req, res) => {
    req.body.author = req.user._id;
    const store =  await (new Store(req.body)).save();
    req.flash('success',`Succefully create ${store.name}, now You are Prosoem.`);
    res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
    const store = await (Store.find());
    res.render('stores', {title : 'THis is deliciuours', store : store});
}

exports.getStoreBySlug = async(req, res, next) => {
    const store = await Store.findOne({slug: req.params.slug});
    console.log(store, 'GET STORE DETAIl');
    if(!store) return next();
    res.render('store', { store, title : store.name});
}

const confirmAuthor = (store, user) => {
    if(!store.author.equals(user._id)){
        throw Error ('You must own a store in order to edit store');
    }
}
exports.editStore = async (req, res) => {
    const store = await Store.findOne({ _id: req.params.id});
    console.log(store,'====STORE===');
    confirmAuthor(store,req.user);
    res.render('editStore', {title : `Edit ${store.name}`, store});
}

exports.getStoresByTags = async(req, res) => {
    const tag = req.params.tag;
    console.log(tag,'====');
    const tagQuery = tag || { $exists : true };
    const tagsPromise = Store.getTagsList();
    const storePromise = Store.find({ tags : tagQuery});
    const [tags, stores]  = await Promise.all([tagsPromise, storePromise]);
    res.render('tag', {tags,  title: 'Tags', tag, stores});
}

exports.updateStore = async (req, res) => {
    req.body.location.type = 'Point';
    const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body, {
        new : true,
        runValidators: true,
    }).exec();
    req.flash('success',`Succefully updated ${store.name}, now You are Awesome.`);
    console.log(store,'====STORE===');
    res.redirect(`/stores/${store.id}/edit`);
}

exports.searchStores = async(req, res) => {
    const store = await Store
    .find({
        $text: {
            $search: req.query.q
        }
    }, {
            score: { $meta: 'textScore' }
    })
    .sort({
        score: { $meta: 'textScore' }
    })
    .limit(5);
    res.json(store);
}