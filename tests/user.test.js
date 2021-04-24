
//let dbSetup = require('./setup');

var request = require('supertest');
let app = require('../server');
//request = request('http://localhost:5000');
let _ = require("lodash");
require('dotenv').config({path: __dirname + '/.env'})

var config = {
    host: 'localhost',
    database: 'test_facebk',
    user: 'uche',
    password: 'uche',
    port: 5433

};


var knex = require('knex')({
    client: 'pg',
    connection: config
});


let baseHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json"
};

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

describe('user', () => {
    beforeAll(() => {
      return knex.migrate.latest();
      // you can here also seed your tables, if you have any seeding files
    });
    afterAll(() => {
      return knex.migrate
        .rollback()
        .then(() => knex.destroy());
    });

    //decribe('POST /users/register', () => {
        it('should return a user', async () => {
          
            await request(app).post('/api/v1/users/register')
            .send({"name": "admin","email": "admin@example.com", "password": "1234"})
            .expect(200)
            .expect('Content-Type', /json/)
        })

        it('should return 404 error ', async () => {
            const {body: errorResult} = await request(app).post(`/api/v1/users/register`)
            .send({"name": "admin","email": "admin@example.com", "password": "1234"})
            .expect(400)
          
            expect(errorResult).toStrictEqual({
                error: 'This user alraedy exist',
            })
        })
    //})
  });

