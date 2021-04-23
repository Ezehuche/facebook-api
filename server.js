const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const flash = require('connect-flash');
const passport = require("passport");
const cors = require('cors');
const knex = require("./config/db");
var logger = require('morgan');
var path = require('path');
const helmet = require('helmet');
var swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

require('dotenv').config();

const app = express();
app.use(helmet({
  frameguard: false
}));

// swagger definition
var swaggerDefinition = {
  info: {
      title: 'Facebook API',
      version: '1.0.0',
      description: 'Rest API documentation for Facebook',
  },
  host: 'localhost:5000',
  basePath: '/api/v1/',
};

// options for the swagger docs
var options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ["./api/*"],
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);
swaggerSpec.paths = require('./api-docs/api-paths.json');
swaggerSpec.definitions = require('./api-docs/api-definitions.json');
swaggerSpec.securityDefinitions = require('./api-docs/api-security-definitions.json');
// serve swagger
app.use('/swagger.json', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(logger('dev'));

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization, Accept, X-Custom-Header");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});
//app.use(cookieParser());

app.use(expressSession({
  secret: process.env.SECRET_KEY,
  resave: true,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//auth route doesn't go in express route so it doesn't need auth
require("./api/auth")(app, passport);

//initialize api route
var api = express.Router();
app.use("/api/v1", api);

require('./api/users')(api);
require('./api/posts');

//force all requests to api route to look for token, if token is present in header the user will be logged in with that token
api.use(function (req, res, next) {
    passport.authenticate('jwt', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next();
        }
        req.logIn(user, {
            session: false
        }, function (err) {
            if (err) {
                return next(err);
            }
            return next();
        });
    })(req, res, next);
});

api.use(function (req, res, next) {
  if (res.locals.json) {
      res.json(res.locals.json);
  } else {
      next();
  }
});

app.get('*', async function (req, res) {
  if (req.path.split("/")[3] == "embed" && req.method === 'GET') {
      res.removeHeader('X-Frame-Options');
  }
})


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  console.error(err);
  res.locals.error = req.app.get('env') === 'development' ? err : "unhandled error has happened in server";

  // send the error
  res.status(err.status || 500).json({error: res.locals.error});

  //res.render('error');
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server up and running on port ${port} !`));
