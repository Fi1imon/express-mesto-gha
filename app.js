require('dotenv').config();

const { PORT = 3001, DB_CONN = 'mongodb://localhost:27017/mesto' } = process.env;

const express = require('express');

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const helmet = require('helmet');

const rateLimit = require('express-rate-limit');

const cookieParser = require('cookie-parser');

const { errors } = require('celebrate');

const { login, createUser } = require('./controllers/users');

const { signup, signin } = require('./middlewares/validation');

const { NotFoundError } = require('./errors/NotFoundError');

const { errorHandler } = require('./middlewares/errorHandler');

const auth = require('./middlewares/auth');

const app = express();

app.use(bodyParser.json());

app.use(cookieParser());

app.use(helmet());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.post('/signup', signup, createUser);
app.post('/signin', signin, login);

app.use(auth);

app.use('/users', require('./routes/user'));

app.use('/cards', require('./routes/card'));

app.use(errors());

app.use((req, res, next) => {
  next(new NotFoundError({ message: 'Страница не найдена.' }));
});

app.use(errorHandler);

mongoose.connect(DB_CONN);

app.listen(PORT, () => {
  console.log(`started on: ${PORT}`);
});
