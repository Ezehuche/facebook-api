
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

describe('post', () => {
    let token = null;
    let baseHeaders = null;
    beforeAll(async (done) => {
      //jest.setTimeout(30000)
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
                return done();
            })
    });
    afterAll(() => {
      return knex.migrate
        .rollback()
        .then(() => knex.destroy());
    });

    it('should publish a post', async (done) => {
        await request(app).post('/api/v1/posts/create')
            .set(baseHeaders)
            .send({ "post": "Lorem ipsum dolor sit amet, consectetur adipiscing elit" })
            .expect(200)
            .expect('Content-Type', /json/)
    })

  });

