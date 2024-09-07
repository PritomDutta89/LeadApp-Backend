import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// verify recaptcha
const verifyRecaptcha = async (token) => {
  const secretKey = process.env.CAPTCHA_SECRET_KEY;
  console.log(secretKey)
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  try {
    const response = await axios.post(url);
    return response.data.success; // true if the CAPTCHA is valid
  } catch (error) {
    console.error("Error verifying CAPTCHA:", error);
    return false;
  }
};

// login user
const loginUser = async (req, res) => {
  const { userName, password, recaptchaToken } = req.body;

  try {
    const user = await userModel.findOne({ userName });

    const isHuman = await verifyRecaptcha(recaptchaToken);
    // console.log("isHuman: ", recaptchaToken)

    if (!isHuman) {
      return res
        .status(400)
        .json({ success: false, message: "CAPTCHA verification failed" });
    }

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials." });
    }

    const token = createToken(user._id);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "error" });
  }
};

// create jwt token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

//validate password
const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;
  return passwordRegex.test(password);
};

// register user
const registerUser = async (req, res) => {
  const { name, userName, password } = req.body;

  try {
    // checking is user already exist
    const exists = await userModel.findOne({ userName });
    if (exists) {
      return res.json({ success: false, message: "User already exists." });
    }

    // validating password
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 1 uppercase, 1 lowercase, 1 special character, 1 number, and be at least 7 characters long.",
      });
    }

    // hashing/encryption user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name,
      userName: userName,
      password: hashedPassword,
    });

    const user = await newUser.save();

    // create token based on user id
    const token = createToken(user._id);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "error" });
  }
};

// reset password
const resetPassword = async (req, res) => {
  const { userName, password } = req.body;

  try {
    const user = await userModel.findOne({ userName });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist." });
    }

    // validating password
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 1 uppercase, 1 lowercase, 1 special character, 1 number, and be at least 7 characters long.",
      });
    }

    // hashing/encryption user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword || user.password;
    const updatedPassword = await user.save();

    res.json({ success: true, message: "Password Reset Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "error" });
  }
};

export { loginUser, registerUser, resetPassword };
