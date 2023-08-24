const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');

const {
  getUsers, updateUser, updateAvatar, getCurrentUser, getUser,
} = require('../controllers/users');
const { link } = require('../utils/regularExpressions');

router.get('/', getUsers);

router.get('/me', getCurrentUser);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
}), getUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUser);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().regex(link),
  }),
}), updateAvatar);

module.exports = router;
