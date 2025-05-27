require('dotenv').config();
const mongoose = require('mongoose');

console.log('MONGO_URI loaded:', process.env.MONGO_URI ? 'Yes' : 'No');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('connected successfully!');
  mongoose.connection.close();
  process.exit(0);
}).catch(err => {
  console.error(err.message);
  process.exit(1);
});