const router = require('express').Router();
const { getCards, createCard, deleteCard, setLikeToCard, removeLikeFromCard } = require('../controllers/cards');

router.get('/', getCards);

router.post('/', createCard);

router.delete('/:cardId', deleteCard);

router.put('/:cardId/likes', setLikeToCard);

router.delete('/:cardId/likes', removeLikeFromCard);

module.exports = router;
