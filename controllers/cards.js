const Card = require('../models/card');

const sendError = (err, res) => {
  if (err.name === 'CastError') {
    return res.status(404).send({ message: 'Карточка с указанным id не найдена.' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).send({ message: 'Переданы некорректные данные для создания карточки.' });
  }

  return res.status(500).send({ message: 'На сервере произошла ошибка' });
};

module.exports.getCards = (req, res) => {
  Card.find()
    .then((cards) => res.status(200).send({ cards }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.createCard = (req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;
  if (!name || !link) {
    res.status(400).send({ message: 'Переданы некорректные данные при создании карточки.' });
    return;
  }

  Card.create({
    name, link, owner, likes: [], createdAt: Date.now(),
  })
    .then((card) => res.status(200).send({ card }))
    .catch((err) => sendError(err, res));
};

module.exports.deleteCard = (req, res) => {
  if (req.params.cardId === 'text') {
    res.status(400).send({ message: 'Переданы некорректные данные для создания карточки.' });
    return;
  }

  Card.findOne({ _id: req.params.cardId })
    .then((card) => {
      if (card === null) {
        res.status(404).send({ message: 'Карточка с указанным id не найдена.' });
        return;
      }

      if (req.user._id !== card.owner._id) {
        res.status(403).send({ message: 'У вас нет прав для удаления этой карточки.' });
        return;
      }

      Card.findOneAndDelete({ _id: req.params.cardId })
        .then(() => res.send({ message: 'Карточка успешно удалена' }))
        .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
    })
    .catch((err) => sendError(err, res));
};

module.exports.setLikeToCard = (req, res) => {
  if (!req.user._id) {
    res.status(400).send({ message: 'Переданы некорректные данные для постановки/снятии лайка.' });
    return;
  }

  if (req.params.cardId === 'text') {
    res.status(400).send({ message: 'Переданы некорректные данные для постановки/снятии лайка.' });
    return;
  }

  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        res.status(404).send({ message: 'Карточка с указанным id не найдена.' });
        return;
      }

      res.status(200).send(card);
    })
    .catch((err) => sendError(err, res));
};

module.exports.removeLikeFromCard = (req, res) => {
  if (!req.user._id) {
    res.status(400).send({ message: 'Переданы некорректные данные для постановки/снятии лайка.' });
    return;
  }

  if (req.params.cardId === 'text') {
    res.status(400).send({ message: 'Переданы некорректные данные для постановки/снятии лайка.' });
    return;
  }

  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        res.status(404).send({ message: 'Карточка с указанным id не найдена.' });
        return;
      }

      res.status(200).send(card);
    })
    .catch((err) => sendError(err, res));
};
