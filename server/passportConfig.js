const mongoose = require('mongoose')
let ExtractJwt =  require('passport-jwt').ExtractJwt;
let JwtStrategy = require('passport-jwt').Strategy;
let key = require("./key.js")
const User = require('./model/user.js');
const option = {}
option.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
option.secretOrKey = key.secretOrKey;
module.exports = passport => {
    passport.use(new JwtStrategy(option, (jwt_payload,done) => {
        User.findById(jwt_payload.id,(err,user) => {
            if (err) return done(err,false)
            else if (user) return done(null,user)
            else return done(null,false)
        })
    })
        
    )
}