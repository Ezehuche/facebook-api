// Update with your config settings.
let path = require('path');
require('dotenv').config({path: __dirname + '/.env'})

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: process.env.POSTGRES_DB_NAME,
      user:     process.env.POSTGRES_DB_USER,
      password: process.env.POSTGRES_DB_PASSWORD,
      port: process.env.POSTGRES_DB_PORT
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  test: {
    client: 'postgresql',
    connection: {
      database: 'test_facebk',
      user: 'test',
      password: 'test',
      port: 5432
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: process.env.POSTGRES_DB_NAME,
      user:     process.env.POSTGRES_DB_USER,
      password: process.env.POSTGRES_DB_PASSWORD,
      port: process.env.POSTGRES_DB_PORT
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

};
