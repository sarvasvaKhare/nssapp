//userSchema
const User = require("./../models/user")
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const privateKey = "Sarvasvakhare";

const isLoggedIn = async(req, res, next) => {
    try{
        const token = req.header('Authorization')
        console.log(token)
        const decoded = jwt.verify(token, 'sarvasva')
        console.log(decoded)
        const user = await User.findOne({email : decoded.EMAIL,}).exec()
        if(!user){
            throw new Error
        }
        req.user = user
        next()

    }catch(e){
        res.status(403).json({"error":"Not Authenticated"})
    }
}

module.exports = isLoggedIn