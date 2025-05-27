const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const identifyRoute = require('./routes/identify');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// app.use(bodyParser.json());
app.use(express.json())
app.use('/identify', identifyRoute);

app.get('/', (req, res) => {
  res.send("Hi Bitch")
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  app.listen(5555, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
});