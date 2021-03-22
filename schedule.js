const _ = require("lodash");
const scheduleLib = require("node-schedule");
const firebaseAdmin = require("firebase-admin");
const User = require("./models/user");
const ScheduledNotification = require("./models/ScheduledNotification");
const { MongooseDocument } = require("mongoose");
const schedule = {};
schedule.createSchedule = async function (data,token1,token2) 
{    try {
            const scheduledNotification = new ScheduledNotification(
                {
                            time: data.time,                        
                            notification: 
                            {   title: data.title,
                                 body: data.body
                                },
    });   
     await scheduledNotification.save();
     const timeToSent = data.time.split(":");  
     var hours = timeToSent[0];
     var minutes = timeToSent[1];
     var hours = timeToSent[0];
var minutes = timeToSent[1];  
if(hours>=5){
    if(minutes>=30){
        hours=hours-5;
        minutes=minutes-30;
    }else{
        if(hours==5){
            hours=23
            minutes=minutes+30
        }else{
            hours=hours-6
            minutes=minutes+30
        }
    }
}else{
   if(minutes>=30){
       hours=hours+24-5;
       minutes=minutes-30;
   }else{
       hours=hours+24-6;
       minutes=minutes+30;
   }
}   
     const scheduleId = scheduledNotification._id.toString();    
     const scheduleTimeout = `${minutes} ${hours} * * *`;  
     const tokens=[token1,token2]  
     scheduleLib.scheduleJob(scheduleId, scheduleTimeout, async () =>
    {   const payload = {        
        tokens,        
        title: data.title,       
         body: data.body,    
        };    
        return firebaseAdmin.sendMulticastNotification(payload);   
    }); 
} catch (e)
 {throw e;}};
module.exports = schedule;