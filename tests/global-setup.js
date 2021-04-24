let Knex = require('knex');

const database = 'test_facebk';
require('dotenv').config({path: __dirname + '/.env'})

// Create the database
async function createTestDatabase() {
  const knex = Knex({
    client: 'pg',
    connection: {
      host: 'localhost',
      database: "postgres",
      user: 'uche',
      password: 'uche',
      port: 5433
    },
  })

  try {
    await knex.raw(`DROP DATABASE IF EXISTS ${database}`)
    await knex.raw(`CREATE DATABASE ${database}`)
  } catch (error) {
    throw new Error(error)
  } finally {
    await knex.destroy()
  }
}

// Seed the database with schema and data
async function seedTestDatabase() {
  const knex = Knex({
    client: 'pg',
    connection: {
      host: 'localhost',
      database: 'test_facebk',
      user: 'uche',
      password: 'uche',
      port: 5433
    },
  })

  try {
    console.log('Starting Test Database Migration');
    await knex.migrate.latest()
    await knex.seed.run()
  } catch (error) {
    throw new Error(error)
  } finally {
    await knex.destroy()
  }
}

module.exports = async () => {
    try {
      await createTestDatabase()
      await seedTestDatabase()
      console.log('Test database created successfully')
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
  }