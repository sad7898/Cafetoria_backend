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
const registerUser = async (user,password,email) => {
    const errorMessage = {}
    const newUser = new User({
      user,
      password,
      email,
      post: [],
      liked: []
    })
    const validateToken =  validateAuth(newUser,true);
    if (!validateToken.isValid) return validateToken.error
    const foundUser = await User.findOne({ $or : [ { "user" : newUser.user }, {"email": newUser.email} ] });
    if (foundUser) {
      errorMessage.userDup = "This username is already taken.";
      return errorMessage
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newUser.password,salt);
    newUser.password = hashedPassword;
    return {user: await newUser.save()}
  }

const login = async (user,password) => {
    const userInput = new User({
      user,
      password
    })
    const validateLogin = validateAuth(userInput,false);
    const errorMessage = 'Invalid Username or Password'
    if (!validateLogin.isValid) return validateLogin.error;
    const foundUser = await  User.findOne({user: userInput.user});
    if (!foundUser) return {inputNotFound:errorMessage}
    const passwordIsValid = await bcrypt.compare(userInput.password,foundUser.password);
    if (passwordIsValid){
        const payload = {
          user: foundUser.user,
          id: foundUser._id
        };
        const token = await jwt.sign(payload,key.secretOrKey,{expiresIn: 300000})
        return {token,user: user.user};
      }
      return {inputNotFound:errorMessage}
  }
const verifyUser = async (cookies) => {
  try {
    const payload = await jwt.verify(cookies.token,key.secretOrKey)
    return {isValid: payload}
  }
  catch(err) {
    return {isValid: false}
  }
}


  

  module.exports = {registerUser,login,verifyUser}