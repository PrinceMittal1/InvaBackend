const express = require('express');
const router = express.Router();
const Suggestion = require('../models/Suggestion'); // Import the model


router.post('/support', async (req, res) => {
  try {
    console.log("-------------", req.body)
    const { message, userId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const suggestion = new Suggestion({
      message: message.trim(),
      userId : userId
    });

    await suggestion.save();

    return res.status(200).json({
      success: true,
      message: 'Support request submitted successfully',
      data: {
        id: suggestion._id,
        createdAt: suggestion.createdAt
      }
    });
  } catch (error) {
    console.error('Error saving suggestion:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;