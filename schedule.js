const _ = require("lodash");
const scheduleLib = require("node-schedule");
const admin = require("firebase-admin");
const User = require("./models/user");
const ScheduledNotification = require("./models/ScheduledNotification");
const { MongooseDocument } = require("mongoose");
const schedule = {};
schedule.createSchedule = async function (data,token1,token2) 
{    try {
    console.log(data["link"])
            const scheduledNotification = new ScheduledNotification(
                {
                            time: data.time,                        
                            data: 
                            {   "title": data["title"],
                                 "body": data["body"],
                                 "link": data["link"],
                                 "type": 'link'
                                },
    });   
     await scheduledNotification.save();
     console.log(data.time)
     const timeToSent = data.time.split(":");
     var hours = parseInt(timeToSent[0], 10);
var minutes = parseInt(timeToSent[1], 10); 
console.log(`hours:${hours},minutes:${minutes}`)
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
     console.log(scheduleTimeout) 
     scheduleLib.scheduleJob(scheduleId, scheduleTimeout, 
        ()=>{
            const message = {    
                data:{           
                    title: data.title,       
                    body: data.body,
                    link:data.link
                }
                };
                admin.messaging().sendToDevice(token1, message).then((response)=>{
                    console.log(response)
                    console.log('second-1 notification sent')
                    admin.messaging().sendToDevice(token2, message).then((response)=>{
                        console.log(response)
                        console.log('second-2 notification sent')
                    })  
                })  
        }
     );
} catch (e)
 {throw e;}};
module.exports = schedule;