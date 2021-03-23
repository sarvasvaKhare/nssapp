const mongoose = require("mongoose");
const schema = new mongoose.Schema(
    {    
        time: {type: String},
        days: {type: []},
        data: {},
        expire_at: {type: Date, default: Date.now, expires: 86400} 
    });
const ScheduledNotification = mongoose.model("scheduledNotification", schema);
module.exports = ScheduledNotification;