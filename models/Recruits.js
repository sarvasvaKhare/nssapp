const mongoose = require('mongoose');

const recruitSchema = new mongoose.Schema({
    email: {type:String,unique:true,required: true},
    name:   String,
    ID: String,
    Branch: String,
    PhoneNo:String,
    WhatsappNo:String,
    alternateemail:String,
    preference: {
        first:String,
        second:String,
        third:String
    },
    PHOTO: String
});

const Recruit = mongoose.model('recruit', recruitSchema);
module.exports = Recruit