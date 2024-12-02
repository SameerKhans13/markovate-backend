import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { initializeDatabase } from "./config/database.js";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import dashboardroute from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/dashboard", dashboardroute);

initializeDatabase();

app.listen(8787, () => {
  console.log("Server is running on port 8787");
});

export default app;