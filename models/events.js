// init

const mongoose = require('mongoose');

//findOrCreate module for using function in passport
const findOrCreate = require('mongoose-findorcreate')

const eventSchema = new mongoose.Schema({
    Title: String,
    DateFrom: String,
    DateTo: String,
    Images: [String],
    Content:{
        Intro: String,
        Description: String
    },
    Dailyevent: Boolean
});

eventSchema.plugin(findOrCreate);

const Event = mongoose.model('event', eventSchema);
module.exports = Event
