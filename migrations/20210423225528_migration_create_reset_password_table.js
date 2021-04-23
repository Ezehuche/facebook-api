exports.up = function(knex, Promise) {
    return knex.schema.createTable('password_reset_request', function(table) {
        table.increments();
        table.integer('user_id').references('users.id').onDelete('cascade');
        table.string('hash');
        table.timestamps(true, true);
    })
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.dropTable('password_reset_request');
  };