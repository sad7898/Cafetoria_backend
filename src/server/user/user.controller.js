const userService = require('./user.service')

const register = async (req,res) => {
    const result = await userService.registerUser(req.body.user,req.body.password,req.body.email);
    if (result.user) res.send(result.user);
    else res.status(400).json(result)
}

const login = async (req,res) => {
    const result = await userService.login(req.body.user,req.body.password);
    if (result.token) {
        res.cookie('token', result.token, { httpOnly: true,maxAge: 360000,sameSite: "none",secure: true });
        res.json({token: result.token,user: result.user})
    }
    else res.status(401).json(result);
}
const verifyUser = async (req,res) => {
    const result = await userService.verifyUser(req.cookies)
    if (result.isValid) {
        res.json(result.isValid)
    }
    else res.status(401).send();
}

const logout = async (req,res) => {
    res.clearCookie('token');
    res.cookie('token', 'none', { httpOnly: true,maxAge: 0,sameSite: "none",secure: true });
    res.send("cleared!");
}

module.exports = {register,login,verifyUser,logout}
