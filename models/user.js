const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');



const userSchema = new Schema({
   email: {
       type : String,
       unique : true,
       lowercase: true,
       trim: true,
       validate : [validator.isEmail,'Must use proper Email'],
       required : 'Please Supply Email'
   },
   name: {
       type: String,
       required: 'Please supply a name',
       trim : true
   }, 
   resetPasswordToken : String,
   resetPasswordExpires : Date
   
});

userSchema.virtual('gravatar').get(function (){
    const hash = md5(this.email);
    return `https://www.gravatar.com/avatar/${hash}?s=200`;
})
userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});
userSchema.plugin(mongodbErrorHandler);
module.exports  = mongoose.model('user', userSchema);
