//  it is the index.js file

import express from 'express';
import teacherRoutes from './routes/teacherRoutes.js'; // Adjust the path as needed

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Use teacher routes
app.use('/teacher', teacherRoutes); // Make sure the /teacher prefix is set correctly

// Start the server
app.listen(9889, () => {
    console.log('Server is running on port 9889');
});