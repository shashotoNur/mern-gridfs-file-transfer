const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

const dbURI = require('./config');
const routes = require('./routes/routes');

// Initalize app
const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use(routes);

// Create mongo connection
const connection = mongoose.createConnection(dbURI);
connection.once('open', () =>
{
  // Init stream
  let gridfs = Grid(connection.db, mongoose.mongo);
  gridfs.collection('uploads');
  app.listen(port, () => console.log(`Server started on port ${port}`));
});

module.exports = gridfs;