let File = require('./file');
let Post = require('./base/entity')("posts");

let createPost = function (options, callback) {
    let self = this;

    //Use the Entity create to create the post
    self.create(function (err, created_post) {
        console.log(`Create Post: ${created_post}`);
        callback(err, created_post);
    });
};

//allows to pass option override, no longer relying 100% on store.
Post.prototype.createPost = new Proxy(createPost, {
    apply: function (target, thisArg, argList) {
        if (argList.length === 2) {
            target.bind(thisArg)(...argList)
        } else {
            target.bind(thisArg)(undefined, ...argList);
        }
    }
});

Post.prototype.updatePost = async function () {
    let self = this;
    let updatedPost = await self.update();
    return updatedPost;
};

Post.prototype.publish = async function () {
    let self = this;
    self.data.published = true;
    return await self.update();
};

module.exports = Post;