const { User } = require("../models/");
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");

exports.signup = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg
        });
    }
    req.body.role = 'user';
    const user = new User(req.body);
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                err: `User Already exists for ${req.body.email}`
            });
        }
        res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            id: user._id
        });
    });
};

exports.signin = (req, res) => {
    const errors = validationResult(req);
    const { email, password } = req.body;

    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg
        });
    }

    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "USER email does not exists"
            });
        }

        if (!user.autheticate(password)) {
            return res.status(401).json({
                error: "Email and password do not match"
            });
        }

        //create token
        const token = jwt.sign({ _id: user._id }, process.env.SECRET);
        //put token in cookie
        res.cookie("token", token, { expire: new Date() + 20 });

        //send response to front end
        const { _id, name, email, role } = user;
        return res.json({ token, user: { _id, name, email, role } });
    });
};

exports.signout = (req, res) => {
    res.clearCookie("token");
    res.json({
        message: "User signout successfully"
    });
};

//protected routes
exports.isSignedIn = expressJwt({
    secret: process.env.SECRET,
    algorithms: ['HS256'],
    userProperty: "auth"
});

//custom middlewares
exports.isAuthenticated = (req, res, next) => {
    let checker = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!checker) {
        return res.status(403).json({
            error: "ACCESS DENIED"
        });
    }
    next();
};

exports.isCorrectUserIdPassed = (req, res, next) => {
    if (req.profile.id != req.auth._id) {  
         return res.status(403).json({
            error: "Invalid credentials"
        });;
    }
    next();
}

exports.isAdmin = (req, res, next) => {
    if (req.profile.role != 'admin') {
        return res.status(403).json({
            error: "You are not ADMIN, Access denied"
        });
    }
    next();
};