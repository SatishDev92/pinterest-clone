require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch(err => {
    console.error("Error connecting to MongoDB Atlas", err);
  });

module.exports = mongoose;
