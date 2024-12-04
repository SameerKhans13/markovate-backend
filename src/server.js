import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import teacherRoutes from './routes/teacherRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import dotenv from 'dotenv';
import testRoutes from './routes/testRoutes.js'; 
import { initDB } from './config/database.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use('/teachers', teacherRoutes);
app.use('/students', studentRoutes);
app.use('/tests', testRoutes);

initDB();

// Server setup
const PORT = process.env.PORT || 9889;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
