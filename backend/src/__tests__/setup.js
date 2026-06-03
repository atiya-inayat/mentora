import { config } from "dotenv";
import mongoose from "mongoose";

config({ path: ".env.test" });

export const connectTestDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/mentora_test";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
};

export const disconnectTestDB = async () => {
  await mongoose.disconnect();
};

export const clearTestDB = async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};
