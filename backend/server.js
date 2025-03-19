// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const db = mongoose.connection;
db.on('error', (error) => console.error("MongoDB connection error (event):", error));
db.once('open', () => console.log("MongoDB connection established (event)."));

// Import routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const expenseRoutes = require('./routes/expenses');
app.use('/api/expenses', expenseRoutes);

const incomeRoutes = require('./routes/incomes');
app.use('/api/incomes', incomeRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
