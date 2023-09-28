const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { NotFoundError } = require('../errors/NotFoundError');
const { Unauthorized } = require('../errors/Unauthorized');
const { Conflict } = require('../errors/Conflict');

const { JWT_SECRET } = process.env;

const User = require('../models/user');

module.exports.getUsers = (req, res, next) => {
  User.find()
    .then((users) => res.status(200).send({ users }))
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .then((user) => {
      if (user === null) {
        throw new NotFoundError({ message: 'Пользователь не найден.' });
      }
      res.send(user);
    })
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  User.findOne({ _id: req.params.userId })
    .then((user) => {
      if (user === null) {
        throw new NotFoundError({ message: 'Пользователь не найден.' });
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotFoundError({ message: 'Пользователь с указанным id не найден.' }));
        return;
      }
      next(err);
    });
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
    .catch((err) => {
      if (err.code === 11000) {
        next(new Conflict({ message: 'Пользователь с таким email уже существует.' }));
        return;
      }
      next(err);
    });
};

module.exports.updateUser = (req, res, next) => {
  const userId = req.user._id;
  const { name, about } = req.body;

  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;

  User.findByIdAndUpdate(userId, { avatar }, { new: true })
    .then((user) => res.send(user))
    .catch(next);
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
      });

      res.send({ message: 'Успешно' });
    })
    .catch(next);
};
