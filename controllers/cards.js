const Card = require('../models/card');

const { NotFoundError } = require('../errors/NotFoundError');
const { BadRequest } = require('../errors/BadRequest');
const { Forbidden } = require('../errors/Forbidden');

module.exports.getCards = (req, res, next) => {
  Card.find()
    .then((cards) => res.status(200).send({ cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const owner = req.user._id;
  const { name, link } = req.body;

  Card.create({
    name, link, owner, likes: [], createdAt: Date.now(),
  })
    .then((card) => res.status(200).send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest({ message: 'Переданы некорректные данные для создания карточки.' }));
        return;
      }
      next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findOne({ _id: req.params.cardId })
    .then((card) => {
      if (card === null) {
        throw new NotFoundError({ message: 'Карточка с указанным id не найдена.' });
      }

      if (req.user._id.toString() !== card.owner._id.toString()) {
        next(new Forbidden({ message: 'У вас нет прав для удаления этой карточки.' }));
        return;
      }

      Card.findOneAndDelete({ _id: req.params.cardId })
        .then(() => res.send({ message: 'Карточка успешно удалена' }))
        .catch((err) => {
          if (err.name === 'CastError') {
            next(new NotFoundError({ message: 'Карточка с указанным id не найдена' }));
            return;
          }
          next(err);
        });
    })
    .catch(next);
};

module.exports.setLikeToCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        throw new NotFoundError({ message: 'Карточка с указанным id не найдена.' });
      }

      res.status(200).send(card);
    })
    .catch(next);
};

module.exports.removeLikeFromCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        throw new NotFoundError({ message: 'Карточка с указанным id не найдена.' });
      }

      res.status(200).send(card);
    })
    .catch(next);
};
