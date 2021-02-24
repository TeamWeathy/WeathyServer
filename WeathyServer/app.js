const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const sc = require('./modules/statusCode');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const weathyRouter = require('./routes/weathy');
const weatherRouter = require('./routes/weather');

const { swaggerUi, specs } = require('./modules/swagger');
const exception = require('./modules/exception');
const logger = require('winston');

const app = express();

// set etag false
// 동적 요청에 대한 응답을 보낼 때 etag 생성을 하지 않도록 설정
app.set("etag", false);

// 정적 요청에 대한 응답을 보낼 때 etag 생성을 하지 않도록 설정
const options = { etag: false };
app.use(express.static("public", options));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/weather', weatherRouter);
app.use('/weathy', weathyRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500).json({
        message: err.message
    });
});

module.exports = app;
