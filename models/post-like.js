const Post = require("./post");

let PostLike = require("./base/entity")("comments");

let likePost = function (options, callback) {
    let self = this;

    self.create(function (err, liked_post) {
        callback(err, liked_post);
    });
};

//allows to pass option override, no longer relying 100% on store.
PostLike.prototype.likePost = new Proxy(likePost, {
    apply: function (target, thisArg, argList) {
        if (argList.length === 2) {
            target.bind(thisArg)(...argList)
        } else {
            target.bind(thisArg)(undefined, ...argList);
        }
    }
});

PostLike.prototype.undoLike = async function (callback) {
    let self = this;
    let likedPost = (await PostLike.find({'post_id': self.data.post_id}))[0];
    self.data.id = likedPost.data.id;
    new Promise(function (resolve, reject) {
        self.delete(function (err, deleted_user) {
            if (err) {
                return reject('Cannot undo like!');
            }
            return resolve(`Post like has beenremovedeleted from database!`);
        });
    }).then(function (result) {
        callback(null, result);
    }).catch(function (err) {
        callback(err, null);
    });
};

module.exports = PostLike;