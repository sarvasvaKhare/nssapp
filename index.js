//importing app
const app = require('./app')
const http = require('http')


//port as enviroment variable
const port = process.env.PORT || 3000
const server = http.createServer(app)

//server up check
server.listen(port, () => {
  console.log('Server is up on port ' + port)
})