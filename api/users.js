let User = require('../models/user');
let async = require("async");


module.exports = function (router, passport) {

    router.post('/user/register', function (req, res, next) {
        User.findAll("email", req.body.email, (user) => {
            if (user && user.length > 0) {
                return res.status(400).json({ error: "This user alraedy exist" });
            }
        });
        if (req.body.password) {
            let password = require("bcryptjs").hashSync(req.body.password, 10);
            let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            let metaArr = [];
            if (!req.body.email.match(mailFormat)) {
                res.status(400).json({ error: 'Invalid email format' });
            } else {
                let newUser = new User(req.body);
                newUser.set('password', password);
                newUser.createUser(async function (err, result) {
                    if (err) {
                        res.status(403).json({ error: err });
                    } else {
                        res.status(200).json(result);
                    }
                });
            }
        }
    });

}