<h1 >Facebook Post Functionality API</h1>


## Description
  A RESTFUL API built for Facebook Post Functionality

## Technology Needed
- [NodeJS](https://github.com/nodejs/node) &mdash; Our back end API is a Node express app. It responds to requests RESTfully in JSON.
- [PostgreSQL](http://www.postgresql.org/) &mdash; Our database is Postgres.

## Setup Guide
Get the app running locally in the following way:
```
# Clone the Repo
git clone https://github.com/Ezehuche/facebook-api
run npm install 
Rename .env.example to .env and make necessary changes
the run npm start
the server will be available at http://localhost:5000

# To run tests
npm run test

go to http://localhost:5000/swagger.json to view the api documentation
```
### JWT Authorization
JSON Web token, Authorization header should look like 'JWT TokenFromAuthApi', for example 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsImlhdCI6MTU' Auth api can be found at /auth/token

### Author
Ezeokeke Uche 
* Email: <ezeokeke.remigius@gmail.com>

* Github: [@ezehuche](https://github.com/ezehuche)
* Twitter: [@Ezeokekeuche](https://twitter.com/Ezeokekeuche)
