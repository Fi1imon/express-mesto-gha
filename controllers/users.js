const User = require('../models/user');

const sendError = (err, res) => {
  if (err.name === 'CastError') {
    return res.status(404).send({ message: 'Пользователь не найден' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя.' });
  }

  return res.status(500).send({ message: `Произошла ошибка: ${err.name}` });
};

module.exports.getUsers = (req, res) => {
  User.find()
    .then((users) => res.status(200).send({ users }))
    .catch((err) => res.status(500).send({ message: `Произошла ошибка: ${err.message}` }));
};

module.exports.getUser = (req, res) => {
  if (req.params.id === 'text') {
    res.status(400).send({ message: 'Передан некорректный при поиске пользователя.' });
    return;
  }

  User.findOne({ _id: req.params.id })
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
  const { name, about, avatar } = req.body;

  if (!name || !about || !avatar) {
    res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя.' });
    return;
  }

  User.create({ name, about, avatar })
    .then((user) => res.send({ user }))
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
