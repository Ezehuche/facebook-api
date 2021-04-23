
let Comment = require("./base/entity")("comments");

let createComment = function (options, callback) {
    let self = this;

    //Use the Entity create to create the comment
    self.create(function (err, created_comment) {
        console.log(`CreateC omment: ${created_comment}`);
        callback(err, created_comment);
    });
};

//allows to pass option override, no longer relying 100% on store.
Comment.prototype.createComment = new Proxy(createComment, {
    apply: function (target, thisArg, argList) {
        if (argList.length === 2) {
            target.bind(thisArg)(...argList)
        } else {
            target.bind(thisArg)(undefined, ...argList);
        }
    }
});

module.exports = Comment;