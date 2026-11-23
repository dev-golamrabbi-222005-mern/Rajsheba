const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

// Helper to format customer for frontend compatibility
const formatCustomer = (c) => ({
  ...c,
  _id: c._id || String(c.id),
  id: c.id || c._id
});

// @desc    Get all customers
// @route   GET /api/customers
router.get('/', async (req, res) => {
  try {
    if (process.env.USE_JSON_DB === 'true' || !prisma) {
      const { Customer } = require('../config/jsonDb');
      const customers = await Customer.find();
      return res.json(customers.map(formatCustomer));
    }

    const customers = await prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(customers.map(formatCustomer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create or Update a customer (Upsert by phone)
// @route   POST /api/customers
router.post('/', async (req, res) => {
  const { name, phone, email, address } = req.body;

  if (!name || !phone || !address) {
    return res.status(400).json({ message: 'Name, phone, and address are required' });
  }

  const cleanPhone = phone.trim();
  const cleanName = name.trim();
  const cleanEmail = email ? email.trim() : null;
  const cleanAddress = address.trim();

  try {
    if (process.env.USE_JSON_DB === 'true' || !prisma) {
      const { Customer } = require('../config/jsonDb');
      const customer = await Customer.findOneAndUpdate(
        { phone: cleanPhone },
        { name: cleanName, email: cleanEmail || '', address: cleanAddress },
        { new: true, upsert: true }
      );
      return res.status(201).json(formatCustomer(customer));
    }

    const customer = await prisma.customer.upsert({
      where: { phone: cleanPhone },
      update: {
        name: cleanName,
        email: cleanEmail,
        address: cleanAddress,
      },
      create: {
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        address: cleanAddress,
      },
    });

    res.status(201).json(formatCustomer(customer));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
router.delete('/:id', async (req, res) => {
  const customerId = req.params.id;

  try {
    if (process.env.USE_JSON_DB === 'true' || !prisma) {
      const fs = require('fs');
      const path = require('path');
      const dbPath = path.join(__dirname, '../data/db.json');
      if (fs.existsSync(dbPath)) {
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        data.customers = (data.customers || []).filter(c => (c._id !== customerId && String(c.id) !== customerId));
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      }
      return res.json({ message: 'Customer deleted successfully' });
    }

    const idNum = parseInt(customerId, 10);
    if (isNaN(idNum)) {
      return res.status(400).json({ message: 'Invalid customer ID format' });
    }

    await prisma.customer.delete({
      where: { id: idNum },
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
