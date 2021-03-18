const mongoose = require('mongoose');

const recruitedSchema = new mongoose.Schema({
    email: {type:String,unique:true,required: true}
});

const Recruited = mongoose.model('recruited', recruitSchema);
module.exports = Recruited