
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

describe('post', () => {
    beforeAll(async () => {
      await knex.migrate.latest();
      await knex.seed.run();
      request(app).post("/api/v1/auth/token")
            .send({"email": "test@example.com", "password": "1234"})
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                token = res.body.token;
                baseHeaders = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "JWT " + token
                };

            })
    });
    afterAll(() => {
      return knex.migrate
        .rollback()
        .then(() => knex.destroy());
    });

    it('should publish a post', async () => {

        await request(app).post('/api/v1/posts/create')
            .send({ "post": "Lorem ipsum dolor sit amet, consectetur adipiscing elit" })
            .expect(200)
            .expect('Content-Type', /json/)
    })

    it('should return 400 error ', async () => {
        const {body: errorResult} = await request(app).post(`/api/v1/posts/create`)
        .send({ "post": "Lorem ipsum dolor sit amet, consectetur adipiscing elit"})
        .expect(400)
      
        expect(errorResult).toStrictEqual({
            error: 'This user alraedy exist',
        })
    })
  });

