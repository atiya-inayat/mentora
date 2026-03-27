import User from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
export const register = async function (req, res) {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const newUser = await User.create({ name, email, password, role });

    const payload = {
      sub: newUser._id, // Payload — the data you stored (like userId, role)

      role: newUser.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      token: token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
