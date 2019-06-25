const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token
    });

    if (!user) {
      throw new Error();
    }

    //  this token and user properties attaches to the request object and then Express passes that request object to our route handlers so we can access them in there and only exists for that single request
    req.token = token;
    req.user = user;
    next();
    // console.log(token);
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
  // console.log("auth middleware");
  // next();
};

module.exports = auth;
