const express = require('express');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler.middleware');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (_, res) => {
  res.status(200).send('OK');
});

// Routes
app.use('/api', routes);
app.use(errorHandler);

module.exports = app;
