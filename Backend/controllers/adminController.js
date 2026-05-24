const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminCollection = require("../models/adminModel.js");
const adminRegistration = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await adminCollection.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        msg: "User already exists with this email",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const newAdmin = new adminCollection({
      email,
      password: hashedPassword,
    });
    await newAdmin.save();

    // Return success response
    return res.json({
      success: true,
      msg: "New Admin created successfully",
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({
      success: false,
      msg: "An error occurred during registration",
      error: error.message, // Optional: include detailed error for debugging
    });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await adminCollection.findOne({ email });
    if (!existingUser) {
      return res.json({
        success: false,
        msg: "Invalid password or email",
      });
    }
    const isMatched = await bcrypt.compare(password, existingUser.password);
    if (!isMatched) {
      return res.json({
        success: false,
        msg: "Invalid password or email",
      });
    }
    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token);
    return res.json({
      success: true,
      msg: "Admin logged In successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      msg: error.message,
    });
  }
};

module.exports = { adminRegistration, adminLogin };
