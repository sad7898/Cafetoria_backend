const User = require('./server/user/user.model.js');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const isEmpty = require('is-empty');
const bcrypt = require("bcrypt");
const key = require('./server/key.js');
const validateAuth = (data,needEmail) => {
    let error = {};
    let checkList = (needEmail) ? ["user","password","email"] : ["user","password"]
    checkList.forEach((val) => {
        data[val] = (isEmpty(data[val]) ? "" : data[val]);
        if (validator.isEmpty(data[val])) error[val] = "is required";
    })
    if (needEmail){
        if (!validator.isEmail(data.email)) error.email = "Email is invalid";
    }
    if (!validator.isLength(data.password, {min: 7, max: 16})) error.password = "Invalid password length";
    let us = data.user;
    let pw = data.password;
    if (
    us.replace(/\.\.+/g,"").replace(/[.*+\-?^${}()|[\]\\@#$%\']/g, '').length != us.length || 
    pw.replace(/\.\.+/g).replace(/[.*+\-?^${}()|[\]\\@#$%\']/g, '').length != pw.length
    ) {
        error.password = "Username or password cannot contain following characters";
    }
    return {error, isValid: isEmpty(error)};
}
const registerUser = (user,password,email) => {
    const errorMessage = {}
    let newUser = new User({
      user: user,
      password: password,
      email: email,
      post: [],
      liked: []
    })
    const validateToken =  validateAuth(newUser,true);
    if (validateToken.isValid){
    User.findOne({user: newUser.user}, (err,found) => {
      if (err) throw err
      if (found){
        errorMessage.userDup = "This username is already taken.";
        return errorMessage
      }
    User.findOne({email: newUser.email}, (err,found) => {
        if (err) throw err
        if (found){
          errorMessage.emailDup = "This email is already taken.";
          return errorMessage
        }
        else {
          bcrypt.genSalt(10, (salt) => {
              bcrypt.hash(newUser.password,salt, (hash) => {
                newUser.password = hash;
                newUser.save((err,userSaved) => {
                  if (err) throw err
                    return {user: userSaved};
                })
            })
          })
        }
      })
    })
  }
  else {
    return validateToken.error
  } 
  }

const login = (user,password) => {
    const userInput = new User({
      user: user,
      password: password
    })
    const validateLogin = validateAuth(userInput,false);
    const errorMessage = 'Invalid Username or Password'
    if (!validateLogin.isValid) return validateLogin.error;
    else {
    User.findOne({user: userInput.user},(err,userFound) => {
        if (err) throw err
        if (!userFound) return {inputNotFound:errorMessage}
        else {
          bcrypt.compare(userInput.password,userFound.password)
          .then((isMatch) => {
            if (isMatch){
              const payload = {
                user: userFound.user,
                id: userFound._id
              };
              jwt.sign(payload,key.secretOrKey,{expiresIn: 300000},(err,token) => {
                if (err) throw err
                return {token: token};
              })
            }
            return {inputNotFound:errorMessage}
          })
        }
      })}
    }
const verifyUser = (cookies) => {
    jwt.verify(cookies.token,key.secretOrKey,(err,decodedToken) => {
        if (err) return {isValid: false}
        return {isValid: decodedToken}
    });
}


  

  module.exports = {registerUser,login,verifyUser}