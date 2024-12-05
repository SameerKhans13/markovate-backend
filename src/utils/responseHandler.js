// utils/responseHandler.js
import logger from './logger.js';

export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };

  logger.info('Success response:', { data: response });
  return res.status(statusCode).json(response);
};

export const errorResponse = (res, error, statusCode = 500) => {
  const response = {
    success: false,
    error: {
      message: error.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      code: error.code,
      type: error.type
    },
    timestamp: new Date().toISOString()
  };

  logger.error('Error response:', { data: response });
  return res.status(statusCode).json(response);
};

export const validationResponse = (res, errors) => {
  const response = {
    success: false,
    error: {
      message: 'Validation Error',
      details: errors
    },
    timestamp: new Date().toISOString()
  };

  logger.warn('Validation error:', { data: response });
  return res.status(400).json(response);
};

export const paginatedResponse = (res, data, page, limit, total) => {
  const response = {
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    },
    timestamp: new Date().toISOString()
  };

  logger.info('Paginated response:', { data: response });
  return res.status(200).json(response);
};

export const notFoundResponse = (res, message = 'Resource not found') => {
  const response = {
    success: false,
    error: {
      message,
      code: 'NOT_FOUND'
    },
    timestamp: new Date().toISOString()
  };

  logger.warn('Not found response:', { data: response });
  return res.status(404).json(response);
};

export const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  const response = {
    success: false,
    error: {
      message,
      code: 'UNAUTHORIZED'
    },
    timestamp: new Date().toISOString()
  };

  logger.warn('Unauthorized response:', { data: response });
  return res.status(401).json(response);
};

export const forbiddenResponse = (res, message = 'Access forbidden') => {
  const response = {
    success: false,
    error: {
      message,
      code: 'FORBIDDEN'
    },
    timestamp: new Date().toISOString()
  };

  logger.warn('Forbidden response:', { data: response });
  return res.status(403).json(response);
};