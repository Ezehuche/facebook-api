let async = require("async")
let jwt = require('jsonwebtoken');
let bcrypt = require("bcryptjs");
let User = require("../models/user");

module.exports = function(app, passport) {

    app.post('/api/v1/auth/token', passport.authenticate('local-login', {session:false}), function(req, res) {
        console.log(req.user);
        let token = jwt.sign({  uid: req.user.data.id }, process.env.SECRET_KEY, { expiresIn: '3h' });
        console.log(token);
        console.log(jwt.verify(token, process.env.SECRET_KEY));
        res.json({token:token});
    });

}