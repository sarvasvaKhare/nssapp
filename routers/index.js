// router setup
const express = require('express')
const router = new express.Router()
const bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: true })
var jsonparser= bodyParser.json()
var nodemailer = require('nodemailer');
//firebase admin sdk
var admin = require("firebase-admin");

var serviceAccount = require("./../nss-282015-firebase-adminsdk-xspz0-1b20ee59df.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nss-282015.firebaseio.com"
});


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'yourpassword'
  }
});
// authentication setup

const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const authentication = require('./../middleware/auth')
const User = require('../models/user')
const Event = require('../models/events')
const Recruit = require('../models/Recruits')
const Hr = require('../models/Hr')
const department = require('../models/Department')
var profile = ''
// index route
router.get('', (req, res) => {
  res.redirect('/contacts')
})
router.post('/login', urlencodedParser, async (req, res) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    if (ticket) {
      const { email, name, picture } = ticket.getPayload()
      const ID = email.slice(0, 9)
      const check = email.slice(9)
      var mem=false;
      var dep=null;
      var token = ''
      if (true) {
        const user = await User.findOne({ email: email })

        if (user) {
          const d = new Date()
          const tperson = await User.findOne({ email: email }, 'dept designation').exec()
          tperson.PHOTO=picture
          tperson.QRCODE=ID.concat(d)
          tperson.FMTOKEN=req.body.fmToken
          if(tperson.dept){
            dep=tperson.dept
            mem=true;
          tperson.ACCESSLEVEL=tperson.dept.concat(tperson.designation)
          }
          token = jwt.sign({ EMAIL: email }, 'sarvasva')
        } else {
          const d = new Date()
          const nperson = new User({
            email: email,
            name: name,
            PHOTO: picture,
            QRCODE: ID.concat(d),
            ACCESSLEVEL: '.',
            FMTOKEN: req.body.fmToken
          })
          await nperson.save()
          token = jwt.sign({ EMAIL: email }, 'sarvasva')
        }
        const HR = await Hr.find({email:email})
        var access=false
        if(HR.length){
          access=true
        }
        res.status(200).json({ "token":token,"NSS":mem,"dept":dep,"access":access})
      }
    } else {
      throw new Error()
    }
  } catch (e) {
    console.log(e)
    res.status(500).send({"err":"error in logging"})
  }
})

// redirected route to render result page
router.get('/result', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user._id)
    res.status(200).json(req.user._id)
  } else {
    console.log('fail1')
    res.status(401).redirect('/login')
  }
})
router.get('/profile', authentication, (req, res) => {
  res.status(200).send({
    user: req.user
  })
})
router.get('/contacts', (req, res) => {
  // res.status(200).json(result)
  User.find({ designation: { $exists: true } },(err, results) => {
    if (err) {
      console.log(err)
    } else {
      for(let i=0;i<results.length;i++){
        if(results[i].PHOTO){
        }else{
          results[i].PHOTO=null;
          results[i].QRCODE=null;
          results[i].ACCESSLEVEL=null;
        }
      }
      res.json(results)
    }
  })
})
router.get('/events', async (req, res) => { 
   const result1= await Event.find({ Dailyevent: true })
   const result2= await Event.find({ Dailyevent: false }) 
   res.status(200).send({"dailyevent":result1,"mainevent":result2})
  })
router.post('/events', (req, res) => {
  const nevent = new Event({
    Title: req.body.title,
    DateFrom: req.body.datefrom,
    DateTo: req.body.dateto,
    Images: req.body.images,
    Content: {
      Intro: req.body.intro,
      Description: req.body.description
    },
    Dailyevent: req.body.event
  })
})
router.post('/refreshqr', urlencodedParser, (req,res)=>{
  const email = req.body.email;
  const user = User.findOne({ email: email })
        if (user) {
          const d = new Date()
          const ID = email.slice(0, 9)
          User.findOneAndUpdate({ email: email }, {QRCODE: ID.concat(d)})
          res.status(200).send()
        }else{
          console.log('err');
          res.status(500).send()
        }
})
router.post('/form',authentication,urlencodedParser,(req,res)=>{
  console.log(req.body)
  const nrecruit= new Recruit({
    email: req.user.email,
    name: req.user.name,
    ID: req.body.ID,
    Branch: req.body.branch,
    PhoneNo:req.body.PhoneNo,
    WhatsappNo:req.body.WhatsappNo,
    alternateemail:req.body.alternateemail,
    preference: {
        first:req.body.first,
        second:req.body.second,
        third:req.body.third
    },
    PHOTO:req.user.PHOTO
  })
  // var mailOptions = {
  //   from: 'youremail@gmail.com',
  //   to: req.user.email,
  //   subject: 'Your recruitment form was submitted',
  //   text: 'That was easy!'
  // }
  // transporter.sendMail(mailOptions, function(error, info){
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log('Email sent: ' + info.response);
  //   }
  // });
  nrecruit.save().then(()=>{
    res.status(200).send({
      "success": true
    })
  }).catch((err)=>{
    console.log(err)
    res.status(400).send({
      "err":"form already exists"
    })
  })
})
router.get('/form',authentication, async (req,res)=>{
    const list= await Recruit.find({"preference.first":req.user.dept,"preference.second":{$ne:"accepted"}})
    res.status(200).send(list)
})

router.post('/reject',authentication,jsonparser,async (req,res)=>{
const HR = await Hr.find({email:req.user.email})
  console.log(HR)
  if(HR.length){
    const doc= await Recruit.findOne({email:req.body.email})
    doc.preference.first=doc.preference.second;
    doc.preference.second=doc.preference.third;
    doc.preference.third=null;
    const reciever = User.findOne({email:req.body.email})
    const  registrationToken = reciever.FMTOKEN
    const Message={
      "title":"Selected",
      "body":doc.preference.first,
      "next preference": doc.preference.first
    }
      admin.messaging().sendToDevice(registrationToken, Message, options)
      .then( response => {

       console.log("Notification sent successfully")
       
      })
      .catch( error => {
          console.log(error);
      });
    // var mailOptions = {
    //   from: 'youremail@gmail.com',
    //   to: req.user.email,
    //   subject: 'Your recruitment form was submitted',
    //   text: 'That was easy!'
    // }
    // transporter.sendMail(mailOptions, function(error, info){
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log('Email sent: ' + info.response);
    //   }
    // });
    doc.save().then(()=>{
      res.status(200).send({"success":true})
    }).catch((err)=>{
      res.status(400).send({"msg":"error in rejecting"})
    })
  }else{
    res.status(403).send({"msg":"unauthori"})
  }
})
router.post('/accept',authentication,jsonparser, async (req,res)=>{
  const HR = await Hr.find({email:req.user.email})
  console.log(HR)
  if(HR.length){
    console.log(req.body.email)
    const doc= await Recruit.findOne({email:req.body.email})
    console.log(doc)
    doc.preference.second="accepted";
    doc.preference.third=null;
    const reciever = User.findOne({email:req.body.email})
    const  registrationToken = reciever.FMTOKEN
    const Message={
      "title":"Selected",
      "body":doc.preference.first
    }
      admin.messaging().sendToDevice(registrationToken, Message, options)
      .then( response => {

       console.log("Notification sent successfully")
       
      })
      .catch( error => {
          console.log(error);
      });
    // var mailOptions = {
    //   from: 'youremail@gmail.com',
    //   to: req.user.email,
    //   subject: 'Your recruitment form was submitted',
    //   text: 'That was easy!'
    // }
    // transporter.sendMail(mailOptions, function(error, info){
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log('Email sent: ' + info.response);
    //   }
    // });
    doc.save().then(()=>{
      res.status(200).send({"success":true})
    }).catch((err)=>{
      res.status(400).send({"msg":"error in accepting"})
    })
  }else{
    res.status(403).send({"msg":"unauthori"})
  }
})
router.post('meet',authentication,jsonparser,(req,res)=>{
  const Message = {
    "link": req.body.link,
    "time": req.body.time,
    "title": "meet link"
  }
  const reciever = User.findOne({email:req.body.email})
  const  registrationToken = reciever.FMTOKEN
    
      admin.messaging().sendToDevice(registrationToken, Message, options)
      .then( response => {

       console.log("Notification sent successfully")
       
      })
      .catch( error => {
          console.log(error);
      });
  res.status(200).send(Message)
  // var mailOptions = {
  //   from: 'youremail@gmail.com',
  //   to: req.user.email,
  //   subject: 'Your recruitment form was submitted',
  //   text: 'That was easy!'
  // }
  // transporter.sendMail(mailOptions, function(error, info){
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log('Email sent: ' + info.response);
  //   }
  // });
})
router.get('/recruited',authentication,jsonparser, async (req,res)=>{
  const list= await Recruit.find({"preference.first":req.user.dept,"preference.second":"accepted"})
  res.status(200).send(list)
})
router.post('/access',authentication,jsonparser,(req,res)=>{
  const newHr = new Hr({
    email: req.body.email
  })
  newHr.save().then(()=>{
    res.status(200).send({"success":true})
  }).catch(()=>{
    res.status(400).send({"msg":"err in giving access"})
  })
})
router.post("/updatefm",authentication,jsonparser, async (req,res)=>{
  const user = await User.findOne({ email: req.user.email })
  user.FMTOKEN=req.body.fmToken
  user.save().then(()=>{
    res.status(200).send({"success":true})
  }).catch((err)=>{
  console.log(err)
  res.status(400).send({"msg":"error in updating"})
  })
})
router.get("/department",authentication,jsonparser, async (req,res)=>{
  const dept = req.body.dept
  const data = Department.findOne({"dept":dept})
  res,status(200).send(data)
})
router.post("/department",authentication,jsonparser, async (req,res)=>{
  const newdepartment = new department({
    dept: req.body.dept,
    data: req.body.data
  })
  newdepartment.save().then(()=>{
    res.status(200).send({"success":true})
  }).catch((err)=>{
    console.log(err)
    res.status(400).send({"msg":"dept data already exists"})
  })
})
// exporting module for app.js
module.exports = { router, profile }
