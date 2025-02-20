const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const errorHandler = require('./errors/errorHandler');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: '*',
  }),
);

// routes
const loginRoute = require('./routes/login');
const datesRoute = require('./routes/dates');
const draggableItemsRoute = require('./routes/draggableItems');

app.use('/api/login', loginRoute);
app.use('/api/dates', datesRoute);
app.use('/api/draggable-items', draggableItemsRoute);
app.use('/images', express.static('images'));

app.use(errorHandler);

// initial routes
app.get('/', (req, res) => {
  res.send(
    'Express is on the way and listening dude....Give me some api routes to resolve! Bit bucket on the run!!!!!!!!',
  );
});

app.get('/api', (req, res) => {
  res.send('Api route');
});

app.listen(process.env.PORT || 8000, '0.0.0.0');
