const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { NotFoundError } = require('../errors/NotFoundError');
const { Unauthorized } = require('../errors/Unauthorized');

const { JWT_SECRET } = process.env;

const User = require('../models/user');

const sendError = (err, res) => {
  console.log(err.name);

  if (err.name === 'CastError') {
    res.status(404).send({ message: 'Пользователь с указанным id не найден.' });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).send({ message: 'Переданы некорректные данные для создания пользователя.' });
    return;
  }

  res.status(500).send({ message: 'На сервере произошла ошибка' });
};

module.exports.getUsers = (req, res) => {
  User.find()
    .then((users) => res.status(200).send({ users }))
    .catch((err) => sendError(err, res));
};

module.exports.getCurrentUser = (req, res) => {
  User.findOne({ _id: req.user._id })
    .then((user) => {
      if (user === null) {
        throw new NotFoundError({ message: 'Пользователь не найден.' });
      }
      res.send(user);
    })
    .catch((err) => sendError(err, res));
};

module.exports.getUser = (req, res, next) => {
  User.findOne({ _id: req.params.userId })
    .then((user) => {
      if (user === null) {
        throw new NotFoundError({ message: 'Пользователь не найден.' });
      }
      res.send(user);
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    email, password, about, name, avatar,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, about, name, avatar,
    }))
    .then((user) => {
      res.send({
        email: user.email,
        about: user.about,
        name: user.name,
        avatar: user.avatar,
      });
    })
    .catch(next);
};

module.exports.updateUser = (req, res) => {
  const userId = req.user._id;
  const { name, about } = req.body;

  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => sendError(err, res));
};

module.exports.updateAvatar = (req, res) => {
  const userId = req.user._id;
  const { avatar } = req.body;

  User.findByIdAndUpdate(userId, { avatar }, { new: true })
    .then((user) => res.send(user))
    .catch((err) => sendError(err, res));
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials({ email, password })
    .then((user) => {
      if (!user) {
        throw new Unauthorized({ message: 'Проверьте корректность отправленных данных.' });
      }

      const token = jwt.sign(
        { _id: user._id },
        JWT_SECRET,
        { expiresIn: '7d' },
      );

      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      });

      res.send({ message: 'Успешно' });
    })
    .catch(next);
};
