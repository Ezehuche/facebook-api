let File = require('./file');
let User = require('./user');
let references = [
    {"model": File, "referenceField": "post_id", "direction": "from", "readOnly": true},
    {"model": User, "referenceField": "user_id", "direction": "to", "readOnly": true}
];
let Post = require('./base/entity')("posts", references);
let Comment = require('./comment');
let PostLike = require('./post-like');

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

Post.prototype.deletePost = function (callback) {
    let self = this;
    new Promise(function (resolve, reject) {
        File.findAll("post_id", self.data.id, function(files) {
            if(files.length && files.length > 0){
                files.map(function (file){
                    file.deleteFile(function (err, result) {
                        if(!err) {
                            return resolve(result);
                        } else {
                            return reject(err);
                        }
                    });
                });
            }else{
                return resolve(self);
            }
        })
    }).then(function(){
        return new Promise(function (resolve, reject) {
            Comment.findAll("post_id", self.data.id, function(comments) {
                if(comments.length && comments.length > 0){
                    comments.map(function (comment){
                        comment.delete(function (err, result) {
                            if(!err) {
                                return resolve(result);
                            } else {
                                return reject(err);
                            }
                        });
                    });
                }else{
                    return resolve(self);
                }
                
            })
        });
    }).then(function(){
        return new Promise(function (resolve, reject) {
            PostLike.findAll("post_id", self.data.id, function(likes) {
                if(likes.length && likes.length > 0){
                    likes.map(function (like){
                        like.delete(function (err, result) {
                            if(!err) {
                                return resolve(result);
                            } else {
                                return reject(err);
                            }
                        });
                    });
                }else{
                    return resolve(self);
                }
            })
        });

    }).then(function (){
        return new Promise(function (resolve, reject) {
            self.delete(function (err, deleted_post) {
                if (err) {
                    return reject('Post cannot be deleted!');
                }
                return resolve(`Post ${self.data.id} has been deleted from database!`);
            });
        });
    }).then(function () {
        callback(null, `Post ID: ${self.data.id} has been removed.`);
    }).catch(function (err) {
        callback(err, null);
    });
}

module.exports = Post;