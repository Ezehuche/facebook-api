let Comment = require('../models/comment');
let auth = require('../middleware/auth');


module.exports = function (router) {

    router.post('/comment/:post_id', auth(), function (req, res, next) {
       let post_id = req.params.post_id;
       let newComment = new Comment(req.body);
       newComment.set("post_id", post_id);
       newComment.set("user_id", req.user.data.id);
        newComment.createComment(function (err, result) {
            if (err) {
                return res.status(403).json({ error: err });
            } else {
                return res.status(200).json(result);
            };
        });
    });


    return router;
}