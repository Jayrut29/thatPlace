const passprot = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('user');


passprot.use(User.createStrategy());

passprot.serializeUser(User.serializeUser());
passprot.deserializeUser(User.deserializeUser());
