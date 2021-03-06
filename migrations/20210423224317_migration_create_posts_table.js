exports.up = function(knex, Promise) {
    return knex.schema.createTable('posts', function(table) {
        table.increments();
        table.integer('user_id').references('users.id');
        table.boolean('published').defaultTo(true);
        table.string('post');
        table.timestamps(true, true);
    })
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.dropTable('posts');
  };