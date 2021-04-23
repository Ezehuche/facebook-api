let User = require('./base/entity')("users");


/**

 */
let createUser = function (options, callback) {
    let self = this;
    self.data.email = self.data.email.toLowerCase();
    
    //Use the Entity create to create the user
    self.create(function (err, created_user) {
        console.log(`Create User: ${created_user}`);
        callback(err, created_user);
    });
};

//allows to pass option override, no longer relying 100% on store.
User.prototype.createUser = new Proxy(createUser, {
    apply: function (target, thisArg, argList) {
        if (argList.length === 2) {
            target.bind(thisArg)(...argList)
        } else {
            target.bind(thisArg)(undefined, ...argList);
        }
    }
});

module.exports = User;