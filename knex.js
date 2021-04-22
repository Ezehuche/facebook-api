const environment = process.env.NODE_ENV || 'development'
const kfile = require('../knexfile')[environment]
module.exports = require('knex')(kfile)