const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');

const {
  getUsers, updateUser, updateAvatar, getCurrentUser, getUser,
} = require('../controllers/users');

router.get('/', getUsers);

router.get('/me', getCurrentUser);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().regex(/[0-z]{20,30}/),
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
    avatar: Joi.string().required().regex(/https?:\/\/w?w?w?\.?[0-z-]{1,63}\.?[0-z-]{1,63}\.[A-z]{1,10}[0-z\S]{1,100}/),
  }),
}), updateAvatar);

module.exports = router;
