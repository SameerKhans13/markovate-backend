// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        details: err.errors
      });
    }
  
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'Invalid or expired token'
      });
    }
  
    if (err.name === 'DatabaseError') {
      return res.status(503).json({
        error: 'Database Error',
        message: 'Database operation failed'
      });
    }
  
    // Default error
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'Something went wrong'
        : err.message
    });
  };