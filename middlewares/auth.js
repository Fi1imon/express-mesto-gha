const jwt = require('jsonwebtoken');
const { Unauthorized } = require('../errors/Unauthorized');

const { JWT_SECRET } = process.env;

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    next(new Unauthorized({ message: 'Необходима авторизация' }));
  }

  let payload;

  try {
    const token = authorization.replace('Bearer ', '');
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    next(new Unauthorized({ message: 'Необходима авторизация' }));
  }

  req.user = payload;
  next();
};
