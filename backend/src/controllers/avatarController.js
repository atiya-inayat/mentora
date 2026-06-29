import multer from "multer";
import User from "../models/User.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
  if (allowed.test(file.originalname)) cb(null, true);
  else cb(new Error("Only image files (jpg, jpeg, png, gif, webp) are allowed"));
};

export const uploadAvatar = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

export const uploadUserPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const result = await uploadToCloudinary(req.file.buffer);
    const photoUrl = result.secure_url;

    const user = await User.findByIdAndUpdate(req.user._id, { photo: photoUrl }, { new: true });

    return res.status(200).json({
      success: true,
      photo: photoUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return res.status(500).json({ success: false, message: "Failed to upload photo" });
  }
};
