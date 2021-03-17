const mongoose = require('mongoose');

const HrSchema = new mongoose.Schema({
    email: {type:String,unique:true,required: true}
});

const Hr = mongoose.model('Hr', HrSchema);
module.exports = Hr