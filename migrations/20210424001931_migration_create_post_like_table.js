exports.up = function(knex, Promise) {
    return knex.schema.createTable('post_like', function(table) {
        table.increments();
        table.integer('user_id').references('users.id').onDelete('cascade');
        table.integer('post_id').references('posts.id').onDelete('cascade');
        table.timestamps(true, true);
    })
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.dropTable('post_like');
  };