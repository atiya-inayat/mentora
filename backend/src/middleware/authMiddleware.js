import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  try {
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
