require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('./models/connection')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const protectedRouter = require('./routes/protected');
const accountsRouter = require('./routes/accounts');
const verifyJWT = require('./middleware/verifyJWT');

var app = express();

const cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(verifyJWT);
app.use('/protected', protectedRouter);
app.use('/accounts', accountsRouter);

module.exports = app;
