require('dotenv').config();

const { PORT = 3000, DB_CONN = 'mongodb://localhost:27017/mesto' } = process.env;

const express = require('express');

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');

const { celebrate, Joi, errors } = require('celebrate');

const { login, createUser } = require('./controllers/users');

const auth = require('./middlewares/auth');

const app = express();

app.use(bodyParser.json());

app.use(cookieParser());

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().max(320).email(),
    password: Joi.string().required().min(8).max(20),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().max(320).email(),
    password: Joi.string().required().min(8).max(20),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(/https?:\/\/w?w?w?\.?[0-z-]{1,63}\.?[0-z-]{1,63}\.[A-z]{1,10}[0-z\S]{1,100}/),
  }),
}), createUser);

app.use(auth);

app.use('/users', require('./routes/user'));

app.use('/cards', require('./routes/card'));

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  if (err.code === 11000) {
    res.status(409).send({ message: 'Пользователь с таким email уже существует.' });
    return;
  }

  res
    .status(statusCode)
    .send({
      message: statusCode === 500 ? `На сервере произошла ошибка: ${message}` : message,
    });
});

app.use((req, res, next) => {
  next(res.status(404).send({ message: 'Страница не найдена.' }));
});

mongoose.connect(DB_CONN);

app.listen(PORT, () => {
  console.log(`started on: ${PORT}`);
});
