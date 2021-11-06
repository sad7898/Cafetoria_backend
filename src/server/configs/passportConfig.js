const JwtStrategy = require('passport-jwt').Strategy;
const key = require("./db.config")
const User = require('../user/user.model.js');

const cookieExtractor = (req) => {
    let token=null;
    if (req && req.cookies) token = req.cookies.token
    return token
}
const option = {
    secretOrKey: key.secretOrKey,
    jwtFromRequest: cookieExtractor
}
module.exports = passport => {
    passport.use(new JwtStrategy(option, (jwt_payload,done) => {
        User.findById(jwt_payload.id,(err,user) => {
            if (err) return done(err,false)
            if (user) return done(null,user)
            return done(null,false)
        })
    })
        
    )
}