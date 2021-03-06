// config/passport.js

// load all the things we need
let LocalStrategy = require('passport-local').Strategy;
let bcrypt = require('bcryptjs');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

process.on('unhandledRejection', function (e) {
    
})

// create the pool somewhere globally so its lifetime
// lasts for as long as your app is running

// expose this function to our app using module.exports
module.exports = function (passport) {
    let User = require('../models/user');

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.get('id'));
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (result) {
            done(null, result);
        })
    });


    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, name, password, done) {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne('email', name.toLowerCase(), function (result) {
                
                
                if (result.data) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

                }
                else {
                    var newUser = new User({"email": name, "password": bcrypt.hashSync(password, 10), "role_id": 1});
                    newUser.createUser(function (err, result) {
                        
                        return done(err, result);
                    })
                }
            });

        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, name, password, done) { // callback with email and password from our form
            User.findOne('email', name.toLowerCase(), async function (result) {
                if (!result.data) {
                    return done(null, false, {message: "bad user"}); // req.flash is the way to set flashdata using connect-flash
                }

                return done(null, result);
            });


        }));

    let opts = {};
    opts.secretOrKey = process.env.SECRET_KEY;
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");

    passport.use(new JwtStrategy(opts, async function (jwt_payload, done) {
        let query = jwt_payload.email ? {email: jwt_payload.email} : {id: jwt_payload.uid};
        let user = (await User.find(query))[0];
        if (user.data) {
            done(null, user);
        } else {
            done(null, false);
        }
    }));

};