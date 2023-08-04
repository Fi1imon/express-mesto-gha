const express = require('express');

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  req.user = {
    _id: '64cbc6fd2fe82ddf36748cf1',
  };

  next();
});

app.use('/users', require('./routes/user'));

app.use('/cards', require('./routes/card'));

app.use((req, res, next) => {
  next(res.status(404).send({ message: 'Страница не найдена.' }));
});

const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/mesto');

app.listen(PORT, () => {
  console.log(`started on: ${PORT}`);
});
