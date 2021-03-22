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
        Reason1:String,
        second:String,
        Reason2:String,
        third:String,
        Reason3:String,
    },
    anyOtherComm:String,
    PHOTO: String
});

const Recruit = mongoose.model('recruit', recruitSchema);
module.exports = Recruit