const userCollection = require("../models/userModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer.js");
const adminCollection = require("../models/adminModel.js");

const sendWelcomeEmail = async (email, userName) => {
  try {
    const mailOptions = {
      from: process.env.SENDER_MAIL,
      to: email,
      subject: "Welcome to CampusConnext!",
      html: `
        <div style="background-color:#f4f4f4; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to CampusConnext!</h1>
              <p style="margin: 5px 0 0;">Your journey starts here</p>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${
                userName || "there"
              },</p>
              <p style="font-size: 15px;">We're thrilled to have you on board! CampusConnext is your gateway to connecting with your campus community. Explore, engage, and make the most of your experience.</p>
              <div style="margin: 30px auto; width: fit-content; padding: 15px 30px; background-color: #e6f3e6; border-radius: 8px; font-size: 18px; font-weight: bold; color: #28a745;">
                Get Started Now!
              </div>
              <p style="font-size: 14px;">If you have any questions, feel free to reach out to us at <a href="mailto:campusconnext16@gmail.com" style="color: #28a745;">campusconnext16@gmail.com</a>.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
              <p style="font-size: 13px; color: #777;">Thank you, <br/>Team CampusConnext</p>
            </div>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending welcome email:", error.message);
  }
};

const register = async (req, res) => {
  try {
    const { userName, email, mobileNo, password } = req.body;

    // Email format check
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        msg: "Invalid email format",
      });
    }

    // Password strength check
    if (!validator.isStrongPassword(password)) {
      return res.json({
        success: false,
        msg: "Password must be strong (min 8 chars, 1 uppercase, 1 number, 1 symbol)",
      });
    }

    // Duplicate email check
    const existingUser = await userCollection.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        msg: "User already exists with this email",
      });
    }

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new userCollection({
      userName,
      email,
      mobileNo,
      password: hashedPassword,
    });

    await newUser.save();

    // JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Change to true in production (with HTTPS)
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send welcome email
    await sendWelcomeEmail(email, userName); // Pass email and userName

    // Final response
    res.json({
      success: true,
      msg: "Account created successfully. Welcome email sent.",
    });
  } catch (error) {
    res.json({
      success: false,
      msg: error.message,
    });
  }
};

module.exports = register;

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.json({ success: false, msg: "Invalid email or password" });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.json({ success: false, msg: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send welcome email
    await sendWelcomeEmail(email, user.userName);

    res.json({ success: true, msg: "Logged in successfully" });
  } catch (error) {
    console.error("Login error:", error.message);
    res.json({ success: false, msg: "An error occurred during login" });
  }
};

const setResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        msg: "User does not exist with this email",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_MAIL,
      to: email,
      subject: "CampusConnext | Password Reset OTP",
      html: `
        <div style="background-color:#f4f4f4; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #4A90E2; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">CampusConnext</h1>
              <p style="margin: 5px 0 0;">Secure OTP Verification</p>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${
                user.userName || "there"
              },</p>
              <p style="font-size: 15px;">You recently requested to reset your password. Use the OTP below to complete the process:</p>
              <div style="margin: 30px auto; width: fit-content; padding: 15px 30px; background-color: #f0f0f0; border-radius: 8px; font-size: 32px; letter-spacing: 6px; font-weight: bold; color: #333;">
                ${otp}
              </div>
              <p style="margin-top: 25px; font-size: 14px;">⚠️ This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
              <p style="font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
              <p style="font-size: 13px; color: #777;">Need help? Contact us at campusconnext16@gmail.com</p>
              <p style="font-size: 13px; color: #777;">Thank you, <br/>Team CampusConnext</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      msg: `OTP sent to ${email}`,
    });
  } catch (error) {
    console.error("Reset OTP error:", error.message);
    return res.json({
      success: false,
      msg: "An error occurred while sending OTP",
    });
  }
};

const checkResetOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        msg: "User does not exist with this email",
      });
    }
    if (otp !== user.resetOtp) {
      return res.json({
        success: false,
        msg: "Incorrect OTP",
      });
    }
    if (Date.now() > user.resetOtpExpiresAt) {
      return res.json({
        success: false,
        msg: "OTP expired",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      msg: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Check reset OTP error:", error.message);
    res.json({
      success: false,
      msg: "An error occurred while verifying OTP",
    });
  }
};

const setVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        msg: "User does not exist with this email",
      });
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        msg: "User Already verified",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_MAIL,
      to: email,
      subject: "CampusConnext | Email Verification OTP",
      html: `
        <div style="background-color:#f4f4f4; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #4A90E2; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">CampusConnext</h1>
              <p style="margin: 5px 0 0;">Secure OTP Verification</p>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${
                user.userName || "there"
              },</p>
              <p style="font-size: 15px;">You recently requested to verify your email. Use the OTP below to complete the process:</p>
              <div style="margin: 30px auto; width: fit-content; padding: 15px 30px; background-color: #f0f0f0; border-radius: 8px; font-size: 32px; letter-spacing: 6px; font-weight: bold; color: #333;">
                ${otp}
              </div>
              <p style="margin-top: 25px; font-size: 14px;">⚠️ This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
              <p style="font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
              <p style="font-size: 13px; color: #777;">Need help? Contact us at campusconnext16@gmail.com</p>
              <p style="font-size: 13px; color: #777;">Thank you, <br/>Team CampusConnext</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      msg: `OTP sent to ${email}`,
    });
  } catch (error) {
    console.error("Verification OTP error:", error.message);
    return res.json({
      success: false,
      msg: "An error occurred while sending OTP",
    });
  }
};

const checkVerifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        msg: "User does not exist with this email",
      });
    }
    if (otp !== user.verifyOtp) {
      return res.json({
        success: false,
        msg: "Incorrect OTP",
      });
    }
    if (Date.now() > user.verifyOtpExpiresAt) {
      return res.json({
        success: false,
        msg: "OTP expired",
      });
    }

    user.isVerified = true;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      msg: "Account verified successfully",
    });
  } catch (error) {
    console.error("Check verify OTP error:", error.message);
    res.json({
      success: false,
      msg: "An error occurred while verifying OTP",
    });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await userCollection
      .findById(req.id)
      .select("-password -mobileNo");
    if (!user) {
      return res.json({
        success: false,
        msg: "Invalid user ID",
      });
    }
    res.json({
      success: true,
      msg: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get user error:", error.message);
    res.json({
      success: false,
      msg: "An error occurred while fetching user",
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.json({
      success: true,
      msg: "User logged Out successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      msg: error.message,
    });
  }
};
module.exports = {
  register,
  login,
  setResetOtp,
  checkResetOtp,
  setVerificationOtp,
  checkVerifyOtp,
  getUser,
  logout,
};
