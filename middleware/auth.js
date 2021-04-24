let jwt = require('jsonwebtoken');


/**
 *
 * @param model - if model is defined the auth function will check for ownership, assumes there is user_id existing
 * @param correlation_id - string representing the field you want to check the params.id against
 * @returns {Function}
 */

let auth = function (permission = null, model = null, correlation_id = "user_id", bypassPermissions = ["can_administrate"]) {
    return async function (req, res, next) {
        if (req.user) {
            if (model) {
                let id = req.params.id;
                model.findOne("id", id, function (result) {
                    console.log("correlation id: " + correlation_id + " " + req.user.get("id"));
                    if (result.get(correlation_id) == req.user.get("id")) {
                        console.log("user owns id " + id + "or has can_manage")
                        return next();
                    }
                    return res.status(401).json({ error: "Unauthorized user" });

                });
                return;
            }
            else {
                return next();
            }

        }
        else {
            return res.status(401).json({ "error": "Unauthenticated" });
        }

    };
};

module.exports = auth;