// init

const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

//findOrCreate module for using function in passport
const findOrCreate = require('mongoose-findorcreate')

//userSchema
const jwt = require('jsonwebtoken')

const privateKey = "Sarvasvakhare";

const userSchema = new mongoose.Schema({
    email: String,
    name:   String,
    PHOTO: String,
    dept: String,
    designation: String,
    ACCESSLEVEL: String,
    QRCODE: String,
    FMTOKEN:String
});

userSchema.methods.getPublicProfile = async function() {
    const user = this
    return {
        EMAIL:user.EMAIL,
        name:user.name,
        PHOTO:user.PHOTO,
        dept:user.dept,
        designation:user.designation,
        ACCESSLEVEL: user.ACCESSLEVEL,
        QRCODE : user.QRCODE
    }
}
userSchema.plugin(passportLocalMongoose, { usernameField: 'googleId', saltField: process.env.SALT, hashField: process.env.HASH })
userSchema.plugin(findOrCreate);

const User = mongoose.model('user', userSchema, 'user');
module.exports = User