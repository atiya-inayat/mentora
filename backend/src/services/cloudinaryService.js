import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadToCloudinary = (buffer, folder = "mentora/avatars") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: {
          width: 400,
          height: 400,
          crop: "fill",
          gravity: "face",
          quality: "auto",
          fetch_format: "auto",
        },
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};
