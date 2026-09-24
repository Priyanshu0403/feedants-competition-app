const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const config = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: config.clientOrigin === '*' ? true : config.clientOrigin.split(',') }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
if (config.nodeEnv !== 'test') app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use('/uploads', express.static(path.join(process.cwd(), config.uploadDir)));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
