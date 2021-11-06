const mongoose = require('mongoose')
let ExtractJwt =  require('passport-jwt').ExtractJwt;
let JwtStrategy = require('passport-jwt').Strategy;
let key = require("../key.js")
const User = require('../user/user.model.js');
const option = {}
option.secretOrKey = key.secretOrKey;
const cookieExtractor = (req) => {
    if (req && req.cookies) token = req.cookies['jwt']
}
module.exports = passport => {
    passport.use(new JwtStrategy(option, (jwt_payload,done) => {
        User.findById(jwt_payload.id,(err,user) => {
            if (err) return done(err,false)
            else if (user) return done(null,user)
            return done(null,false)
        })
    })
        
    )
}