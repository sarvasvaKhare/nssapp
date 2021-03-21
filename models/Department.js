const mongoose = require('mongoose');

const deptSchema = new mongoose.Schema({
    dept: {type:String,unique:true,required: true},
    data: {type:String}
});

const department = mongoose.model('department', deptSchema);
module.exports = department