import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["mentee", "mentor", "admin"],
      default: "mentee",
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {});

export default mongoose.model("User", userSchema);
