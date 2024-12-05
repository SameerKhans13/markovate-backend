// utils/dbUtils.js
import pool from '../config/database.js';
import logger from '../config/winston.js';

export const executeTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const buildPagination = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return {
    limit: parseInt(limit),
    offset,
    page: parseInt(page)
  };
};

export const buildWhereClause = (filters = {}, startIndex = 1) => {
  const values = [];
  const conditions = [];

  Object.entries(filters).forEach(([key, value], index) => {
    if (value !== undefined && value !== null) {
      conditions.push(`${key} = $${index + startIndex}`);
      values.push(value);
    }
  });

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
    paramCount: values.length
  };
};

export const buildUpdateQuery = (table, data, conditions, startIndex = 1) => {
  const updates = [];
  const values = [];
  let paramCount = startIndex;

  // Build SET clause
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updates.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  // Build WHERE clause
  const whereConditions = [];
  Object.entries(conditions).forEach(([key, value]) => {
    whereConditions.push(`${key} = $${paramCount}`);
    values.push(value);
    paramCount++;
  });

  const query = `
    UPDATE ${table}
    SET ${updates.join(', ')},
        updated_at = CURRENT_TIMESTAMP
    WHERE ${whereConditions.join(' AND ')}
    RETURNING *
  `;

  return { query, values };
};

export const handleDatabaseError = (error) => {
  const errorTypes = {
    '23505': 'Duplicate entry error',
    '23503': 'Foreign key violation',
    '23502': 'Not null violation',
    '42P01': 'Table not found',
    '42703': 'Column not found',
    '22P02': 'Invalid data type',
    '28000': 'Invalid authorization',
    '3D000': 'Database not found'
  };

  logger.error('Database error:', {
    code: error.code,
    message: error.message,
    detail: error.detail,
    constraint: error.constraint
  });

  const message = errorTypes[error.code] || 'Database error occurred';
  const newError = new Error(message);
  newError.originalError = error;
  newError.code = error.code;
  
  throw newError;
};

export const buildQuery = ({
  table,
  fields = '*',
  joins = [],
  where = {},
  groupBy = null,
  orderBy = null,
  limit = null,
  offset = null
}) => {
  let query = `SELECT ${fields} FROM ${table}`;
  const values = [];
  let paramCount = 1;

  // Add joins
  joins.forEach(join => {
    query += ` ${join.type || 'LEFT'} JOIN ${join.table} ON ${join.condition}`;
  });

  // Add where clause
  if (Object.keys(where).length) {
    const { whereClause, values: whereValues, paramCount: newCount } = 
      buildWhereClause(where, paramCount);
    query += ' ' + whereClause;
    values.push(...whereValues);
    paramCount = newCount + 1;
  }

  // Add group by
  if (groupBy) {
    query += ` GROUP BY ${groupBy}`;
  }

  // Add order by
  if (orderBy) {
    query += ` ORDER BY ${orderBy}`;
  }

  // Add limit and offset
  if (limit) {
    query += ` LIMIT $${paramCount}`;
    values.push(limit);
    paramCount++;

    if (offset) {
      query += ` OFFSET $${paramCount}`;
      values.push(offset);
    }
  }

  return { query, values };
};