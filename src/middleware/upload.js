// middleware/upload.js
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

// Configure storage
const storage = multer.diskStorage({
 destination: (req, file, cb) => {
   cb(null, 'uploads/');
 },
 filename: (req, file, cb) => {
   const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
   cb(null, uniqueName);
 }
});

// File filter
const fileFilter = (req, file, cb) => {
 const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
 
 if (allowedTypes.includes(file.mimetype)) {
   cb(null, true);
 } else {
   cb(new Error('Invalid file type. Only JPEG, PNG, PDF and TXT files are allowed'), false);
 }
};

// Create multer instance
const upload = multer({
 storage: storage,
 limits: {
   fileSize: 5 * 1024 * 1024 // 5MB
 },
 fileFilter: fileFilter
});

// Error handler middleware
export const handleUploadError = (err, req, res, next) => {
 if (err instanceof multer.MulterError) {
   logger.error('File upload error:', err);
   if (err.code === 'LIMIT_FILE_SIZE') {
     return res.status(400).json({
       error: 'File too large. Maximum size is 5MB'
     });
   }
   return res.status(400).json({ error: err.message });
 }
 next(err);
};

export default upload;