import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

// Import dependencies
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

// Initialize the app
const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded requests

// Example route
app.get('/', (req, res) => {
  res.send('Server is running on port 9889!');
});

// Start the server
const PORT = 9889; // Set the port to 9889
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;