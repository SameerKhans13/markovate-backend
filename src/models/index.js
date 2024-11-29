const sequelize = require('../config/db');
const Teacher = require('./Teacher');

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully!');
  } catch (err) {
    console.error('Error syncing the database:', err);
  }
};

module.exports = { Teacher, syncDatabase };
