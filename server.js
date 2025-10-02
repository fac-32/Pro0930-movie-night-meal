import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

dotenv.config();
const port = process.env._PORT;
const API_KEY = process.env.API_KEY;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticPath = path.join(__dirname, "/frontend");

app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
