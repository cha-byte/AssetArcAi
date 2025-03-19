// backend/routes/incomes.js
const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Unauthorized" });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch(err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

router.post('/', verifyToken, async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    if (!description || !amount || !category || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newIncome = new Income({
      userId: req.user.id,
      description,
      amount,
      category,
      date,
    });
    const savedIncome = await newIncome.save();
    res.status(201).json(savedIncome);
  } catch(err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json(incomes);
  } catch(err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
