
var validator = require('validator');
var isEmpty = require('is-empty');
module.exports = (data,needEmail) => {
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