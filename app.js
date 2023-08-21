const express = require('express');

const mongoose = require('mongoose');

require('dotenv').config();

const bodyParser = require('body-parser');

const app = express();

const { PORT = 3000, DB_CONN = 'mongodb://localhost:27017/mesto' } = process.env;

const { celebrate, Joi } = require('celebrate');

const { login, createUser } = require('./controllers/users');

const auth = require('./middlewares/auth');

app.use(bodyParser.json());

app.post('/signin', login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().max(320),
    password: Joi.string().required().min(8).max(20),
  }),
}), createUser);

app.use(auth);

app.use('/users', require('./routes/user'));

app.use('/cards', require('./routes/card'));

app.use((req, res, next) => {
  next(res.status(404).send({ message: 'Страница не найдена.' }));
});

mongoose.connect(DB_CONN);

app.listen(PORT, () => {
  console.log(`started on: ${PORT}`);
});
