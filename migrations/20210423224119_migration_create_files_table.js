
exports.up = function(knex, Promise) {
    return knex.schema.createTable('files', function(table) {
        table.increments();
        table.integer('user_id').references('users.id').onDelete('cascade');
        table.string('path');
        table.integer('size');
        table.string('name');
        table.string('mimetype');
        table.timestamps(true, true);
    })
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.dropTable('files');
  };