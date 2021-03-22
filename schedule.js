const _ = require("lodash");
const scheduleLib = require("node-schedule");
const firebaseAdmin = require("firebase-admin");
const User = require("./models/user");
const ScheduledNotification = require("./models/ScheduledNotification");
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
     const hours = timeToSent[0];    
     const minutes = timeToSent[1];    
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
    await Promise.all(promises);
} catch (e)
 {throw e;}};
module.exports = schedule;