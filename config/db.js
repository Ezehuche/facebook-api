var config = {
    host: 'localhost',
    user: 'uche',
    database: 'facebk',
    password: 'uche',
    port: 5433
};

var knex = require('knex')({
    client: 'pg',
    connection: config,
    pool: { min: 0, max: 10 }
});

module.exports = knex;