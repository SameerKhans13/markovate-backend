// middleware/auth.js
import jwt from 'jsonwebtoken';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    const user = await Student.findById(decoded.id) || await Teacher.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authenticateTeacher = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    const teacher = await Teacher.findById(decoded.id);
    
    if (!teacher) {
      return res.status(401).json({ error: 'Unauthorized - Teacher access required' });
    }

    req.user = teacher;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};