// it is the server.js file

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { initializeDatabase } from "./config/database.js";  // Ensure the correct path is used
import dotenv from "dotenv";
import studentportal from "./Examportal/studentportal.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardroute from "./routes/dashboardRoutes.js";
import teacherRoutes from './routes/teacherRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import testRoutes from './routes/testRoutes.js'; 
import { initDB } from './config/database.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/answers', studentportal);
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardroute);
app.use(express.json());

// Routes
app.use('/teachers', teacherRoutes);
app.use('/students', studentRoutes);
app.use('/tests', testRoutes);

initDB();
// Initialize the database
initializeDatabase();

app.listen(8787, () => {
  console.log("Server is running on port 8787");
});

export default app;
