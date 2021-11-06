const mongoose = require('mongoose')
let JwtStrategy = require('passport-jwt').Strategy;
let key = require("../key.js")
const User = require('../user/user.model.js');
const option = {
    secretOrKey: key.secretOrKey,
    jwtFromRequest: cookieExtractor
}
const cookieExtractor = (req) => {
    var token=null;
    if (req && req.cookies) token = req.cookies['token']
    return token
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