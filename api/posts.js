let Post = require('../models/post');
let multer = require("multer");
let File = require("../models/file");
let mkdirp = require("mkdirp");
let path = require("path");
let validate = require("../middleware/validate");

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

    router.post('/posts/create', multer({storage: systemStorage }).array('uploadedImages', 10), function (req, res, next) {
        let newPost = new Post(req.body);
        newPost.set("published", true);
        newPost.createPost(function (err, result) {
            if (err) {
                return res.status(403).json({error: err});
            } else {
                if(req.files && req.files.length > 0){
                    let filesToInsert = req.files.map(function(file){
                        if(req.user) {
                            file.user_id = req.user.data.id;
                        }
                        file.name = file.originalname;
                        file.post_id = result.data.id;
                        return file
                    });
                    console.log(filesToInsert);
                    File.batchCreate(filesToInsert, function(files){
                        console.log(files);
                    });
                }
                return res.status(200).json(result);
                //next();
            }
        });
    })

    router.get("/posts/:id(\\d+)", validate(Post), function (req, res, next) {
        let post = res.locals.valid_object;
        post.attachReferences(updatedParent => {
            res.status(200).json(updatedParent);
        });
    });

    router.put("/posts/:id(\\d+)", validate(Post), async function (req, res, next) {
        let post = res.locals.valid_object;
        req.body.id = req.params.id;
        Object.assign(post.data, req.body);
        console.log("updating the post");
        let updatepost = await post.update();
        let out = {
            message: 'User is successfully updated',
            results: updatepost
        }
        res.json(out);
    });

    router.delete(`/posts/:id(\\d+)`, validate(Post), async function (req, res, next) {
        let post = res.locals.valid_object;
        post = await post.attachReferences();
        post.delete(function (err, result) {
            if(err){
                console.error("Server error deleting post: " + err);
                res.status(500).send({ error: "Error deleting" })
            }
            else {
                res.json = {message: `Post with id ${req.params.id} deleted`};   
            }
        })
    });
}