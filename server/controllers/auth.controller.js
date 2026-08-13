import User from "../models/user.model.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email, and password are required.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists.",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const sessionUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    };

    req.session.user = sessionUser;

    return res.status(201).json({
      message: "User successfully registered.",
      user: sessionUser,
    });
  } catch (error) {
    console.error("Registration error: ", error);
    return res.status(500).json({
      message: "Your registration failed.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User with this email not found.",
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials.",
      });
    }

    const sessionUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    };

    req.session.user = sessionUser;

    return res.status(200).json({
      message: "User login successful.",
      user: sessionUser,
    });
  } catch (error) {
    console.error("Login error: ", error);
    return res.status(500).json({
      message: "User login failed.",
    });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out, try again." });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logout successful." });
  });
};

export const getMe = async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = await User.findById(req.session.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching session user" });
  }
};