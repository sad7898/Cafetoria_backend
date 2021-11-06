const validator = require('validator');
const jwt = require("jsonwebtoken");
const isEmpty = require('is-empty');
const bcrypt = require("bcrypt");
const User = require('./user.model.js');
const key = require('../configs/db.config');

const validateAuth = (data,needEmail) => {
    const error = {};
    const checkList = (needEmail) ? ["user","password","email"] : ["user","password"]
    checkList.forEach((val) => {
        data[val] = (isEmpty(data[val]) ? "" : data[val]);
        if (validator.isEmpty(data[val])) error[val] = "is required";
    })
    if (needEmail){
        if (!validator.isEmail(data.email)) error.email = "Email is invalid";
    }
    if (!validator.isLength(data.password, {min: 7, max: 16})) error.password = "Invalid password length";
    const us = data.user;
    const pw = data.password;
    if (
    us.replace(/\.\.+/g,"").replace(/[.*+\-?^${}()|[\]\\@#$%\']/g, '').length !== us.length || 
    pw.replace(/\.\.+/g).replace(/[.*+\-?^${}()|[\]\\@#$%\']/g, '').length !== pw.length
    ) {
        error.password = "Username or password cannot contain following characters";
    }
    return {error, isValid: isEmpty(error)};
}
const registerUser = (user,password,email) => {
    const errorMessage = {}
    const newUser = new User({
      user,
      password,
      email,
      post: [],
      liked: []
    })
    const validateToken =  validateAuth(newUser,true);
    if (validateToken.isValid){
    User.findOne({ $or : [ { "user" : newUser.user }, {"email": newUser.email} ] }, (err,found) => {
      if (err) throw err
      if (found){
        errorMessage.userDup = "This username is already taken.";
        return errorMessage
      }
      bcrypt.genSalt(10, (salt) => {
        bcrypt.hash(newUser.password,salt, (hash) => {
          newUser.password = hash;
          newUser.save((err,userSaved) => {
            if (err) throw err
              return {user: userSaved};
          })
      })
    })
    })
  }
  else {
    return validateToken.error
  } 
  }

const login = (user,password) => {
    const userInput = new User({
      user,
      password
    })
    const validateLogin = validateAuth(userInput,false);
    const errorMessage = 'Invalid Username or Password'
    if (!validateLogin.isValid) return validateLogin.error;
    
    User.findOne({user: userInput.user},(err,userFound) => {
        if (err) throw err
        if (!userFound) return {inputNotFound:errorMessage}
        
          bcrypt.compare(userInput.password,userFound.password)
          .then((isMatch) => {
            if (isMatch){
              const payload = {
                user: userFound.user,
                id: userFound._id
              };
              jwt.sign(payload,key.secretOrKey,{expiresIn: 300000},(err,token) => {
                if (err) throw err
                return {token,user: userFound.user};
              })
            }
            return {inputNotFound:errorMessage}
          })
        
      })
    }
const verifyUser = (cookies) => {
    jwt.verify(cookies.token,key.secretOrKey,(err,decodedToken) => {
        if (err) return {isValid: false}
        return {isValid: decodedToken}
    });
}


  

  module.exports = {registerUser,login,verifyUser}