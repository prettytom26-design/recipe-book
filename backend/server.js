
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/recipes', require('./routes/recipes'));

app.get('/', (req, res) => {
  res.send('Recipe Book API is running');
});

async function startServer() {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
connectTimeoutMS: 10000
    });

    console.log('MongoDB connected');

    app.listen(process.env.PORT || 5000, () => {
      console.log('Server running on port 5000');
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
