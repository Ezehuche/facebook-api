
exports.seed = function(knex) {
  let newpassword = require("bcryptjs").hashSync('1234', 10);
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {id: 1, name: 'test', email: 'test@example.com', password: newpassword}
      ]);
    });
};
