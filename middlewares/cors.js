const allowedCors = [
  'https://mesto.fi1imon.nomoredomainsicu.ru',
  'https://mesto.fi1imon.nomoredomainsicu.ru/',
];

const checkCors = (req, res, next) => {
  const { origin } = req.headers;
  const requestHeaders = req.headers['access-control-request-headers'];
  const { method } = req;

  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', origin);

    if (method === 'OPTIONS') {
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
      res.header('Access-Control-Allow-Headers', requestHeaders);

      res.end();
      return;
    }
  }

  next();
};

module.exports = { checkCors };
