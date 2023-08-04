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

const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/mesto');

app.listen(PORT, () => {
  console.log(`good on: ${PORT}`);
});
