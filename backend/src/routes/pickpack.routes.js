const express = require('express');
const Pick = require('../models/Pick');
const router = express.Router();


router.get('/pending', async (req, res) => {
  try {
    const picks = await Pick.getPending();
    res.json(picks || []);
  } catch (error) {
    console.error('PickPack error:', error);
    res.status(500).json({ error: 'Failed to load picks' });
  }
});


router.post('/', async (req, res) => {
  try {
    const id = await Pick.create(req.body);
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.put('/:id/packed', async (req, res) => {
  try {
    await Pick.updateStatus(req.params.id, 'packed');
    res.json({ message: 'Pick marked as packed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
