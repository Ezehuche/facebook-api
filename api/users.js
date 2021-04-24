let User = require('../models/user');
let async = require("async");
let jwt = require('jsonwebtoken');
let bcrypt = require("bcryptjs");
let notification = require('../config/notification');


module.exports = function (router) {

    router.post('/users/register', function (req, res, next) {
        User.findAll("email", req.body.email, (user) => {
            if (user && user.length > 0) {
                return res.json({ error: "This user alraedy exist" });
            }
        });
        if (req.body.password) {
            let password = require("bcryptjs").hashSync(req.body.password, 10);
            let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            
            if (!req.body.email.match(mailFormat)) {
                res.json({ error: 'Invalid email format' });
            } else {
                let newUser = new User(req.body);
                newUser.set('password', password);
                newUser.createUser(async function (err, result) {
                    if (err) {
                        res.json({ message: 'issue registering user' });
                    } else {
                        res.status(200).json(result);
                        await notification(result.data);
                    }
                });
            }
        }
    });

    router.post('/users/login', async function (req, res) {
        let results = (await User.find({ 'email': req.body.email }))[0];

        // Check if user exists
        if (!results.data) {
            res.status(401).json({ error: "Email not found" });
        }
        bcrypt.compare(req.body.password, results.data.password).then(isMatch => {
            if (isMatch) {
                res.cookie("uid", results.data.id);
                let token = jwt.sign({ uid: results.data.id }, process.env.SECRET_KEY, { expiresIn: '3h' });
                res.status(200).json({ token: token });
            } else {
                res.status(404).json({ error: "Password incorrect" });
            }
        })
    });

    return router;
}