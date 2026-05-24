const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
  try {
    // You can also support Authorization header if needed
    const token = req.cookies.token || req.header("Authorization");
    console.log(token);

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Unauthorized user!! No token provided",
      });
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user id to request
    req.id = decodedToken.id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      msg: "Invalid or expired token",
      error: error.message,
    });
  }
};

module.exports = userAuth;
