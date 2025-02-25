"use strict";
const dotenv = require('dotenv').config();
const { sequelize } = require('./config/ormconfig');
const app = require('./app');
const http = require('http');


const PORT = process.env.PORT || 3006;
let server;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('🟢 Database connected successfully!');
    await sequelize.sync();
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port: ${PORT}`);
    });
  } catch (error) {
    console.error('💣 Database connection failed:', error);
    process.exit(1);
  }
};

startServer();

process.on('uncaughtException', (error) => {
  console.error('⛔ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⛔ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const shutdown = async () => {
  console.log('🔒 Shutting down server gracefully...');

  if (server) {
    await new Promise((resolve) => server.close(resolve));
    console.log('🔐 Server closed');
  }

  await sequelize.close();
  console.log('🏦 Database connection closed');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
