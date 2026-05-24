const jwt = require("jsonwebtoken");
const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({
        success: false,
        msg: "Please login",
      });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decodedToken.id;
    next();
  } catch (error) {
    res.json({
      success: false,
      msg: error.message,
    });
  }
};
module.exports = adminAuth;
