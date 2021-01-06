// router setup
const express = require('express')
const router = new express.Router()
const bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: true })
// authentication setup

const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const authentication = require('./../middleware/auth')
const User = require('../models/user')
const Event = require('../models/events')
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
      var token = ''
      if (check === '@pilani.bits-pilani.ac.in') {
        const user = await User.findOne({ email: email })

        if (user) {
          const d = new Date()
          const tperson = await User.findOne({ email: email }, 'dept designation').exec()
          const eperson = await User.findOneAndUpdate({ email: email }, { name: name, PHOTO: picture, QRCODE: ID.concat(d), ACCESSLEVEL: tperson.dept.concat(tperson.designation) })
          token = jwt.sign({ EMAIL: email }, 'sarvasva')
        } else {
          const d = new Date()
          const nperson = new User({
            email: email,
            name: name,
            PHOTO: picture,
            QRCODE: ID.concat(d),
            ACCESSLEVEL: '.'
          })
          await nperson.save()
          token = jwt.sign({ EMAIL: email }, 'sarvasva')
        }

        res.status(200).json({ token })
      } else {
        res.status(500).send()
      }
    } else {
      throw new Error()
    }
  } catch (e) {
    console.log(e)
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
  User.find({ designation: { $exists: true } }, 'name designation dept m_number email', (err, results) => {
    if (err) {
      console.log(err)
    } else {
      res.json(results)
    }
  })
})
router.get('/events', (req, res) => { 
  var result = [];
   Event.find({ Dailyevent: true }, (err, result1) => 
   { if (err) 
    { console.log(err) }
     else 
     { result.push(result1) } })
     Event.find({ Dailyevent: false }, (err, result2) => 
     { if (err) 
      { console.log(err) } 
      else 
      { result.push(result2) 
        res.json(result); 
      } 
    }) 
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
        }else{
          console.log('err');
        }
})
// exporting module for app.js
module.exports = { router, profile }
