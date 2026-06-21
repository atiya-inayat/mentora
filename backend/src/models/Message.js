import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    content: {
      type: String,
      default: "",
    },

    file: {
      url: { type: String },
      name: { type: String },
      size: { type: Number },
      mimeType: { type: String },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Message", messageSchema);
