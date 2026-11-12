require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbConnection = require('./dbConfig/mongodbConfig');
const router = require('./route');

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Database Connection Call
dbConnection();

// Root route
app.get('/', (req, res) => {
  res.send('Ecommerce Backend API is running!');
});

// Routes
app.use(router);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
