const { Sequelize } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(config.DB_URL || '', {
  dialect: 'postgres',
  logging: false,
});

module.exports = { sequelize };