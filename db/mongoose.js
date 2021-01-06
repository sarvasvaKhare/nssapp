const mongoose = require('mongoose')
// mongodb database setup

try {
  mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(async (db) => {
    console.log('Successfully connected to database :)')
  }).catch((error) => {
    console.log('Not able to connect to database :(', error)
  })
} catch (e) {
  console.log(e)
}
