exports.up = function(knex, Promise) {
    return knex.schema.alterTable('files', function(table) {
        table.integer('post_id').references('posts.id').onDelete('cascade');
    })
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.alterTable('files', function(table) {
        table.dropColumns('post_id');
    })
  };