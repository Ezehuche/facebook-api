let Knex = require('knex');
const config = require("../knexfile");
let connection = config.test.connection;
const database = 'test_facebk';
require('dotenv').config({path: __dirname + '/.env'})

module.exports = async () => {
    const knex = Knex({
        client: 'pg',
        connection: connection,
      })
      
    try {
      await knex.raw(`DROP DATABASE IF EXISTS ${database}`)
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
  }