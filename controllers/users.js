import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import { v4 as uuidv4 } from "uuid";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const externalSignin = async (req, res) => {
  try {
    const { credential } = req.body;
    const decodedData = jwt.decode(credential);

    const existingUser = await User.findOne({ email: decodedData.email });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(uuidv4(), 12);

      const user = await User.create({
        name: decodedData.name,
        password: hashedPassword,
        email: decodedData.email,
      });

      await user.save();

      res.status(200).json({
        user: { name: user.name, email: user.email, profile: user.profile },
        token: credential,
      });
    } else {
      res.status(200).json({
        user: {
          name: existingUser.name,
          email: existingUser.email,
          profile: existingUser.profile,
        },
        token: credential,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(404).json({ message: "User not found" });

    const isPasswordCorect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorect)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
      process.env.SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      user: {
        name: existingUser.name,
        email: existingUser.email,
        profile: existingUser.profile,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signup = async (req, res) => {
  const { username, email, password, confirmpassword } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    if (password !== confirmpassword)
      return res.status(400).json({ message: "Passwords don't match" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: username,
      password: hashedPassword,
      email,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      user: { name: user.name, email: user.email, profile: user.profile },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateProfile = async (req, res) => {
  const profile = req.body;

  if (req.userId.includes("@")) {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { email: req.userId },
        { profile },
        {
          new: true,
        }
      ).exec();

      res.json(updatedUser.profile);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    if (!mongoose.Types.ObjectId.isValid(req.userId))
      return res.status(404).send("User not found");

    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.userId },
        { profile },
        {
          new: true,
        }
      ).exec();

      res.json(updatedUser.profile);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const updateUserData = async (req, res) => {
  const { username, email, oldPassword, newPassword, confirmNewPassword } =
    req.body;

  if (req.userId.includes("@")) {
    try {
      res.json(null);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    const existingUser = await User.findOne({ _id: req.userId });

    const emailCopy = email ? email : existingUser.email;
    const userNameCopy = username ? username : existingUser.name;
    const oldPasswordCopy = oldPassword ? oldPassword : null;
    const newPasswordCopy = newPassword ? newPassword : null;
    const confirmNewPasswordCopy = confirmNewPassword
      ? confirmNewPassword
      : null;

    if (newPasswordCopy !== confirmNewPasswordCopy)
      return res.status(400).json({ message: "Passwords don't match" });

    if (!mongoose.Types.ObjectId.isValid(req.userId))
      return res.status(404).send("User not found");

    let hashedPassword;

    if (oldPasswordCopy && newPasswordCopy && confirmNewPasswordCopy) {
      const isPasswordCorect = await bcrypt.compare(
        oldPasswordCopy,
        existingUser.password
      );

      if (!isPasswordCorect)
        return res.status(400).json({ message: "Invalid password" });

      hashedPassword = await bcrypt.hash(newPasswordCopy, 12);
    }

    const dataToUpdate = hashedPassword
      ? { name: userNameCopy, email: emailCopy, password: hashedPassword }
      : { name: userNameCopy, email: emailCopy };

    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.userId },
        dataToUpdate,
        {
          new: true,
        }
      ).exec();

      const token = jwt.sign(
        { id: updatedUser._id, email: updatedUser.email },
        process.env.SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.json({
        user: { name: updatedUser.name, email: updatedUser.email },
        token,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const deleteUser = async (req, res) => {
  if (req.userId.includes("@")) {
    try {
      await User.findOneAndDelete({ email: req.userId }).exec();

      res.json(null);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    if (!mongoose.Types.ObjectId.isValid(req.userId))
      return res.status(404).send("User not found");

    try {
      await User.findOneAndDelete({ email: req.userId }).exec();

      res.json(null);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
