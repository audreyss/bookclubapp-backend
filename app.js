require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const fileUpload = require('express-fileupload');

require('./models/connection')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const protectedRouter = require('./routes/protected');
const accountsRouter = require('./routes/accounts');
const bookclubsRouter = require('./routes/bookclubs');
const followersRouter = require('./routes/followers');
const verifyJWT = require('./middleware/verifyJWT');

var app = express();

app.use(fileUpload());

app.use(cors({
  origin: 'https://bookclubapp.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'bookclub'],
  credentials: true,
}));

app.options('*', cors());

// app.use(cors());

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
app.use('/bookclubs', bookclubsRouter);
app.use('/followers', followersRouter);

module.exports = app;
