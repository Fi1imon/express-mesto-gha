const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { JWT_SECRET } = process.env;

const User = require('../models/user');

const sendError = (err, res) => {
  if (err.name === 'CastError') {
    return res.status(404).send({ message: 'Пользователь не найден.' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).send({ message: `Переданы некорректные данные при создании пользователя: ${err.message}` });
  }

  return res.status(500).send({ message: `На сервере произошла ошибка: ${err.message}` });
};

module.exports.getUsers = (req, res) => {
  User.find()
    .then((users) => res.status(200).send({ users }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.getCurrentUser = (req, res) => {
  User.findOne({ _id: req.user._id })
    .then((user) => {
      if (user === null) {
        res.status(404).send({ message: 'Пользователь не найден.' });
        return;
      }
      res.send(user);
    })
    .catch((err) => sendError(err, res));
};

module.exports.createUser = (req, res) => {
  const {
    email, password, about, name, avatar,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, about, name, avatar,
    }))
    .then((user) => res.send(user))
    .catch((err) => sendError(err, res));
};

module.exports.updateUser = (req, res) => {
  const userId = req.user._id;
  const { name, about } = req.body;

  // Проверяем наличие хотя бы одного нужного поля в запросе
  if (!about && !name) {
    res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
    return;
  }

  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => sendError(err, res));
};

module.exports.updateAvatar = (req, res) => {
  const userId = req.user._id;
  const { avatar } = req.body;

  // Проверяем наличие нужного поля в запросе
  if (!avatar) {
    res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
    return;
  }

  User.findByIdAndUpdate(userId, { avatar }, { new: true })
    .then((user) => res.send(user))
    .catch((err) => sendError(err, res));
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findUserByCredentials({ email, password })
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        JWT_SECRET,
        { expiresIn: '7d' },
      );

      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
      });

      res.send('good');
    })
    .catch((err) => sendError(err, res));
};
