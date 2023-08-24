const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');

const {
  getCards, createCard, deleteCard, setLikeToCard, removeLikeFromCard,
} = require('../controllers/cards');

router.get('/', getCards);

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().regex(/https?:\/\/w?w?w?\.?[0-z-]{1,63}\.?[0-z-]{1,63}\.[A-z]{1,10}[0-z\S]{1,100}/),
  }),
}), createCard);

router.delete('/:cardId', deleteCard);

router.put('/:cardId/likes', setLikeToCard);

router.delete('/:cardId/likes', removeLikeFromCard);

module.exports = router;
