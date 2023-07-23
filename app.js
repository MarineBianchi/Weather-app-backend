require("dotenv").config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Import de la connection string
require('./models/connection');

// Déclarer les routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var weatherRouter = require('./routes/weather');

var app = express();

// cors
const cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Déclarer les routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/weather', weatherRouter);

module.exports = app;
