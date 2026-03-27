import "dotenv/config"; // loads .env file first, before anything else
import express from "express"; // default import — the express framework
import cors from "cors"; // allows frontend to talk to your backend
import { connectDB } from "./src/config/db.js"; // named import —  db function
import router from "./src/routes/authRoutes.js";

const app = express(); // creates your express app

app.use(cors()); // middleware — enables cross-origin requests
app.use(express.json()); // middleware — lets you read JSON request bodies

const PORT = process.env.PORT || 5000; // reads PORT from .env

app.use("/api/auth", router);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
