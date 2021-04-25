let Post = require('../models/post');
let multer = require("multer");
let File = require("../models/file");
let mkdirp = require("mkdirp");
let path = require("path");
let validate = require("../middleware/validate");
let PostLike = require("../models/post-like");
let auth = require('../middleware/auth');

let systemFilePath = "uploads/uploaded-images";


let systemStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        mkdirp(systemFilePath, err => cb(err, systemFilePath))
    },
    filename: function (req, file, cb) {
        require('crypto').pseudoRandomBytes(8, function (err, raw) {
            cb(err, err ? undefined : req.params.id + "-" + raw.toString('hex'))
        })
    }
});

module.exports = function (router) {

    router.post('/posts/create', auth(), function (req, res, next) {
        let newPost = new Post(req.body);
        newPost.set("user_id", req.user.data.id);
        newPost.set("published", true);
        newPost.createPost(function (err, result) {
            if (err) {
                return res.json({error: 'Issue creating facebook post'});
            } else {
                console.log(result)
                return res.status(200).json(result);
                //next();
            }
        });
    })

    router.post('/posts/file/:id(\\d+)', auth(), validate(Post), multer({storage: systemStorage }).array('image', 10), function (req, res, next) {
        let post = res.locals.valid_object;
        if (req.files && req.files.length > 0) {
            let filesToInsert = req.files.map(function (file) {
                if (req.user) {
                    file.user_id = req.user.data.id;
                }
                file.name = file.originalname;
                file.post_id = post.data.id;
                return file
            });
            console.log(filesToInsert);
            File.batchCreate(filesToInsert, function (files) {
                console.log(files);
                return res.status(200).json(files);
            });
        }
               
    })

    router.get("/posts/:id(\\d+)", auth(), validate(Post), function (req, res, next) {
        let post = res.locals.valid_object;
        post.attachReferences(updatedParent => {
            res.status(200).json(updatedParent);
        });
    });

    router.put("/posts/:id(\\d+)", auth(), validate(Post), async function (req, res, next) {
        let post = res.locals.valid_object;
        req.body.id = req.params.id;
        Object.assign(post.data, req.body);
        console.log("updating the post");
        let updatepost = await post.update();
        let out = {
            message: 'Post is successfully updated',
            results: updatepost
        }
        res.status(200).json(out);
    });

    router.delete(`/posts/:id(\\d+)`, auth(), validate(Post), async function (req, res, next) {
        let post = res.locals.valid_object;
        //post = await post.attachReferences();
        post.deletePost(function (err, result) {
            if(err){
                console.error("Server error deleting post: " + err);
                res.status(500).send({ error: "Error deleting" })
            }
            else {
                res.json({message: `Post with id ${req.params.id} deleted`});   
            }
        })
    });

    router.post("/posts/like/:id(\\d+)", auth(), function (req, res, next) {
        let post_id = req.params.id;
        let newPostLike = new PostLike({
            'post_id': post_id,
            'user_id': req.user.data.id
        });
        newPostLike.likePost(function (err, result) {
            if (err) {
                return res.status(403).json({error: err});
            } else {
                res.json({message: 'post Liked'});
            }
        })
    });

    router.post("/posts/undolike/:id(\\d+)", auth(), function (req, res, next) {
        let post_id = req.params.id;
        let postLike = new PostLike({'post_id': post_id});
        postLike.undoLike(function (err, result) {
            if (err) {
                return res.status(403).json({error: err});
            } else {
                res.json({message: 'post unliked'});
            }
        })
    });

    return router;
}