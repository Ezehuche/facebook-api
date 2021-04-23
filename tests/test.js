
var test = require('tape');
var string = ''
let stream = test.createStream();
stream.on('data',function(buffer){
    var part = buffer.toString();
    string += part;
});

stream.on('end',function(){
    console.log('final output ' + string);
});

var request = require('supertest');
request = request('http://localhost:5000');
let _ = require("lodash");
let enableDestroy = require('server-destroy');
require('dotenv').config({path: require("path").join(__dirname, '../.env')});
let log = console.log;

var config = {
    host: process.env.POSTGRES_DB_HOST,
    user: process.env.POSTGRES_DB_USER,
    password: process.env.POSTGRES_DB_PASSWORD,
    port: process.env.POSTGRES_DB_PORT,
    multipleStatements: true

};


var knex = require('knex')({
    client: 'pg',
    connection: config
});

let fs = require("fs");
let Promise = require("bluebird");

const before = test;

let token = null;
let baseHeaders = null;
let app = null;
let server = null;

let stripDates = function(body){
    let newObj = body;
    for(var i in body){
        if(i == "updated_at" || i == "created_at"){
            delete newObj[i];
        }
        else if( newObj[i] === Object(newObj[i])){
            newObj[i] = stripDates(newObj[i]);
        }
    }

    return newObj;
}
let responseHandler = function(assert, expected, test, callback){
    return function(err, res){
        if(err || (!res || !res.body)) {
            assert.error(err, "error")
            callback(err, res);
        }else{
            let body = stripDates(res.body);
            let strippedExpected = stripDates(expected);
            assert.same(body, strippedExpected, test);
            callback(null, res);
        }

    }

}
before('before', function (assert) {
    //reset(function (status) {
        console.log(status);
        request.post("/api/v1/auth/token")
            .send({"email": "admin", "password": "1234"})
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                assert.error(err, "token request made")
                token = res.body.token;
                baseHeaders = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "JWT " + token
                };
                assert.end();

            })
    //})

});

test.onFinish(function(){
    setTimeout(function(){
        process.exit();
    }, 2000);

})

