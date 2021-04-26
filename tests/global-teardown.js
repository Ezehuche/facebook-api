let Knex = require('knex');
const database = 'test_facebk';
require('dotenv').config({path: __dirname + '/.env'})

module.exports = async () => {
    const knex = Knex({
        client: 'pg',
        connection: {
          host: 'localhost',
          database: 'test_facebk',
          user: 'test',
          password: 'test',
          port: 5432
        },
      })
      
    try {
      await knex.raw(`DROP DATABASE IF EXISTS ${database}`)
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
  }