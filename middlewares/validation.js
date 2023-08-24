const { Joi } = require('celebrate');
const { link } = require('../utils/regularExpressions');

const signin = Joi.object().keys({
  email: Joi.string().required().max(320).email(),
  password: Joi.string().required().min(8).max(20),
});

const signup = Joi.object().keys({
  email: Joi.string().required().max(320).email(),
  password: Joi.string().required().min(8).max(20),
  name: Joi.string().min(2).max(30),
  about: Joi.string().min(2).max(30),
  avatar: Joi.string().regex(link),
});

module.exports = { signup, signin };
