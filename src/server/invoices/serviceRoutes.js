const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

// Helper to format service for frontend compatibility
const formatService = (s) => ({
  ...s,
  _id: s._id || String(s.id),
  id: s.id || s._id
});

// @desc    Get all services
// @route   GET /api/services
router.get('/', async (req, res) => {
  try {
    if (process.env.USE_JSON_DB === 'true' || !prisma) {
      const { Service } = require('../config/jsonDb');
      const services = await Service.find();
      return res.json(services.map(formatService));
    }

    const services = await prisma.service.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(services.map(formatService));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create or Update a service (Upsert by name)
// @route   POST /api/services
router.post('/', async (req, res) => {
  const { name, rate } = req.body;

  if (!name || rate === undefined) {
    return res.status(400).json({ message: 'Service name and rate are required' });
  }

  const cleanName = name.trim();
  const numericRate = Number(rate);

  try {
    if (process.env.USE_JSON_DB === 'true' || !prisma) {
      const { Service } = require('../config/jsonDb');
      const service = await Service.findOneAndUpdate(
        { name: cleanName },
        { rate: numericRate },
        { new: true, upsert: true }
      );
      return res.status(201).json(formatService(service));
    }

    const service = await prisma.service.upsert({
      where: { name: cleanName },
      update: { rate: numericRate },
      create: { name: cleanName, rate: numericRate },
    });

    res.status(201).json(formatService(service));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a service
// @route   DELETE /api/services/:id
router.delete('/:id', async (req, res) => {
  const serviceId = req.params.id;

  try {
    if (process.env.USE_JSON_DB === 'true' || !prisma) {
      const fs = require('fs');
      const path = require('path');
      const dbPath = path.join(__dirname, '../data/db.json');
      if (fs.existsSync(dbPath)) {
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        data.services = (data.services || []).filter(s => (s._id !== serviceId && String(s.id) !== serviceId));
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      }
      return res.json({ message: 'Service deleted successfully' });
    }

    const idNum = parseInt(serviceId, 10);
    if (isNaN(idNum)) {
      return res.status(400).json({ message: 'Invalid service ID format' });
    }

    await prisma.service.delete({
      where: { id: idNum },
    });

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
