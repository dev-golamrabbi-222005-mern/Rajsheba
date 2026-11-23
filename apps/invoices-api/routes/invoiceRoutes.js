const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

// Helper to format invoice output for frontend compatibility
const formatInvoice = (inv) => {
  if (!inv) return null;

  const idStr = String(inv.id || inv._id);
  const items = (inv.items || []).map((item) => ({
    description: item.description,
    qty: Number(item.qty || 1),
    rate: Number(item.rate || 0),
    amount: Number(item.amount || (Number(item.qty || 1) * Number(item.rate || 0))),
    _id: item.id ? String(item.id) : item._id,
  }));

  const customerObj = inv.customer && typeof inv.customer === 'object' && inv.customer.name
    ? {
        name: inv.customer.name,
        phone: inv.customer.phone,
        email: inv.customer.email || '',
        address: inv.customer.address,
      }
    : {
        name: inv.customerName || '',
        phone: inv.customerPhone || '',
        email: inv.customerEmail || '',
        address: inv.customerAddress || '',
      };

  const paymentOptionsObj = inv.paymentOptions || {
    accountName: inv.accountName || 'RAJSEBA.COM',
    accountNumber: inv.accountNumber || '02433002451',
    bankName: inv.bankName || 'Bank Asia PLC',
    branch: inv.branch || 'Rajshahi Branch',
    routingNumber: inv.routingNumber || '070811937',
  };

  return {
    ...inv,
    _id: idStr,
    id: inv.id || idStr,
    customer: customerObj,
    items,
    paymentOptions: paymentOptionsObj,
    signeeName: inv.signeeName || 'Ariful Islam Arif',
    signeeRole: inv.signeeRole || 'CEO, Rajseba Design Studio',
    totalAmount: Number(inv.totalAmount || 0),
    totalPayableAmount: Number(inv.totalPayableAmount || inv.totalAmount || 0),
    paidAmount: Number(inv.paidAmount || 0),
    dueAmount: Number(inv.dueAmount || 0),
    paymentStatus: inv.paymentStatus || (Number(inv.dueAmount || 0) === 0 ? 'Paid' : 'Due'),
    status: inv.status || 'active',
  };
};

// @desc    Get all active invoices
// @route   GET /api/invoices
router.get('/', async (req, res) => {
  try {
    if (process.env.USE_JSON_DB === 'true' || !prisma) {
      const { Invoice } = require('../config/jsonDb');
      const invoices = await Invoice.find().sort();
      const active = invoices.filter(i => i.status !== 'trashed');
      return res.json(active.map(formatInvoice));
    }

    const invoices = await prisma.invoice.findMany({
      where: { status: { not: 'trashed' } },
      include: { items: true, customer: true },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    res.json(invoices.map(formatInvoice));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all trashed invoices
// @route   GET /api/invoices/trash
router.get('/trash', async (req, res) => {
  try {
    if (process.env.USE_JSON_DB === 'true' || !prisma) {
      const { Invoice } = require('../config/jsonDb');
      const invoices = await Invoice.find().sort();
      const trashed = invoices.filter(i => i.status === 'trashed');
      return res.json(trashed.map(formatInvoice));
    }

    const invoices = await prisma.invoice.findMany({
      where: { status: 'trashed' },
      include: { items: true, customer: true },
      orderBy: [{ deletedAt: 'desc' }, { date: 'desc' }],
    });

    res.json(invoices.map(formatInvoice));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
router.get('/:id', async (req, res) => {
  const invoiceId = req.params.id;

  try {
    if (process.env.USE_JSON_DB === 'true' || !prisma) {
      const { Invoice } = require('../config/jsonDb');
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
      return res.json(formatInvoice(invoice));
    }

    const idNum = parseInt(invoiceId, 10);
    const where = isNaN(idNum) ? { invoiceNumber: invoiceId } : { id: idNum };

    const invoice = await prisma.invoice.findFirst({
      where,
      include: { items: true, customer: true },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(formatInvoice(invoice));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new invoice
// @route   POST /api/invoices
router.post('/', async (req, res) => {
  const {
    invoiceNumber,
    date,
    customer,
    items,
    totalAmount,
    totalPayableAmount,
    amountInWords,
    templateName,
    paymentOptions,
    signeeName,
    signeeRole,
    paidAmount,
    dueAmount,
    paymentStatus,
  } = req.body;

  if (!invoiceNumber || !customer || !items || items.length === 0) {
    return res.status(400).json({ message: 'Invoice number, customer, and items are required' });
  }

  try {
    if (process.env.USE_JSON_DB === 'true' || !prisma) {
      const { Invoice } = require('../config/jsonDb');
      const newInvoice = new Invoice({
        invoiceNumber,
        date: date || new Date().toISOString(),
        customer,
        items,
        totalAmount: Number(totalAmount || 0),
        totalPayableAmount: Number(totalPayableAmount || totalAmount || 0),
        paidAmount: Number(paidAmount || 0),
        dueAmount: Number(dueAmount || 0),
        paymentStatus: paymentStatus || (Number(dueAmount || 0) === 0 ? 'Paid' : 'Due'),
        amountInWords: amountInWords || '',
        templateName: templateName || 'template1',
        paymentOptions,
        signeeName,
        signeeRole,
        status: 'active',
      });
      const saved = await newInvoice.save();
      return res.status(201).json(formatInvoice(saved));
    }

    // NeonDB Prisma Create
    const cleanItems = (items || []).map((it) => ({
      description: String(it.description || ''),
      qty: Number(it.qty || 1),
      rate: Number(it.rate || 0),
      amount: Number(it.amount || (Number(it.qty || 1) * Number(it.rate || 0))),
    }));

    const parsedDate = date ? new Date(date) : new Date();

    const created = await prisma.invoice.create({
      data: {
        invoiceNumber: String(invoiceNumber).trim(),
        date: parsedDate,
        customerName: customer.name || '',
        customerPhone: customer.phone || '',
        customerEmail: customer.email || null,
        customerAddress: customer.address || '',
        totalAmount: Number(totalAmount || 0),
        totalPayableAmount: Number(totalPayableAmount || totalAmount || 0),
        paidAmount: Number(paidAmount || 0),
        dueAmount: Number(dueAmount || 0),
        paymentStatus: paymentStatus || (Number(dueAmount || 0) === 0 ? 'Paid' : 'Due'),
        amountInWords: String(amountInWords || ''),
        templateName: templateName || 'template1',
        accountName: paymentOptions?.accountName || 'RAJSEBA.COM',
        accountNumber: paymentOptions?.accountNumber || '02433002451',
        bankName: paymentOptions?.bankName || 'Bank Asia PLC',
        branch: paymentOptions?.branch || 'Rajshahi Branch',
        routingNumber: paymentOptions?.routingNumber || '070811937',
        signeeName: signeeName || 'Ariful Islam Arif',
        signeeRole: signeeRole || 'CEO, Rajseba Design Studio',
        status: 'active',
        items: {
          create: cleanItems,
        },
      },
      include: { items: true, customer: true },
    });

    res.status(201).json(formatInvoice(created));
  } catch (error) {
    if (error.code === 'P2002' || error.code === 11000) {
      return res.status(400).json({ message: `Invoice number "${invoiceNumber}" already exists.` });
    }
    res.status(400).json({ message: error.message });
  }
});

// @desc    Move invoice to trash
// @route   DELETE /api/invoices/:id
router.delete('/:id', async (req, res) => {
  const invoiceId = req.params.id;

  try {
    if (process.env.USE_JSON_DB === 'true' || !prisma) {
      const fs = require('fs');
      const path = require('path');
      const dbPath = path.join(__dirname, '../data/db.json');
      if (fs.existsSync(dbPath)) {
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const inv = (data.invoices || []).find(i => i._id === invoiceId || String(i.id) === invoiceId);
        if (inv) {
          inv.status = 'trashed';
          inv.deletedAt = new Date().toISOString();
          fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        }
      }
      return res.json({ message: 'Invoice moved to trash successfully' });
    }

    const idNum = parseInt(invoiceId, 10);
    if (isNaN(idNum)) {
      return res.status(400).json({ message: 'Invalid invoice ID format' });
    }

    await prisma.invoice.update({
      where: { id: idNum },
      data: {
        status: 'trashed',
        deletedAt: new Date(),
      },
    });

    res.json({ message: 'Invoice moved to trash successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Restore a trashed invoice
// @route   PUT /api/invoices/:id/restore
router.put('/:id/restore', async (req, res) => {
  const invoiceId = req.params.id;

  try {
    if (process.env.USE_JSON_DB === 'true' || !prisma) {
      const fs = require('fs');
      const path = require('path');
      const dbPath = path.join(__dirname, '../data/db.json');
      if (fs.existsSync(dbPath)) {
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const inv = (data.invoices || []).find(i => i._id === invoiceId || String(i.id) === invoiceId);
        if (inv) {
          inv.status = 'active';
          delete inv.deletedAt;
          fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
          return res.json({ message: 'Invoice restored successfully', invoice: formatInvoice(inv) });
        }
      }
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const idNum = parseInt(invoiceId, 10);
    if (isNaN(idNum)) {
      return res.status(400).json({ message: 'Invalid invoice ID format' });
    }

    const updated = await prisma.invoice.update({
      where: { id: idNum },
      data: {
        status: 'active',
        deletedAt: null,
      },
      include: { items: true, customer: true },
    });

    res.json({ message: 'Invoice restored successfully', invoice: formatInvoice(updated) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Permanently delete an invoice
// @route   DELETE /api/invoices/:id/force
router.delete('/:id/force', async (req, res) => {
  const invoiceId = req.params.id;

  try {
    if (process.env.USE_JSON_DB === 'true' || !prisma) {
      const fs = require('fs');
      const path = require('path');
      const dbPath = path.join(__dirname, '../data/db.json');
      if (fs.existsSync(dbPath)) {
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        data.invoices = (data.invoices || []).filter(i => i._id !== invoiceId && String(i.id) !== invoiceId);
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      }
      return res.json({ message: 'Invoice permanently deleted' });
    }

    const idNum = parseInt(invoiceId, 10);
    if (isNaN(idNum)) {
      return res.status(400).json({ message: 'Invalid invoice ID format' });
    }

    await prisma.invoice.delete({
      where: { id: idNum },
    });

    res.json({ message: 'Invoice permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update invoice payment / receive due
// @route   PUT /api/invoices/:id/payment
router.put('/:id/payment', async (req, res) => {
  const invoiceId = req.params.id;
  const { amountPaid } = req.body;
  const paymentValue = Number(amountPaid);

  if (isNaN(paymentValue) || paymentValue <= 0) {
    return res.status(400).json({ message: 'Invalid payment amount. Must be a positive number.' });
  }

  try {
    if (process.env.USE_JSON_DB === 'true' || !prisma) {
      const fs = require('fs');
      const path = require('path');
      const dbPath = path.join(__dirname, '../data/db.json');
      if (fs.existsSync(dbPath)) {
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const invoice = (data.invoices || []).find(i => i._id === invoiceId || String(i.id) === invoiceId);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        const currentPaid = Number(invoice.paidAmount || 0);
        const total = Number(invoice.totalPayableAmount || invoice.totalAmount || 0);
        const newPaid = Math.min(total, currentPaid + paymentValue);
        const newDue = Math.max(0, total - newPaid);

        invoice.paidAmount = newPaid;
        invoice.dueAmount = newDue;
        invoice.paymentStatus = newDue === 0 ? 'Paid' : 'Due';

        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        return res.json(formatInvoice(invoice));
      }
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const idNum = parseInt(invoiceId, 10);
    if (isNaN(idNum)) {
      return res.status(400).json({ message: 'Invalid invoice ID format' });
    }

    const existing = await prisma.invoice.findUnique({
      where: { id: idNum },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const currentPaid = Number(existing.paidAmount || 0);
    const total = Number(existing.totalPayableAmount || existing.totalAmount || 0);
    const newPaid = Math.min(total, currentPaid + paymentValue);
    const newDue = Math.max(0, total - newPaid);
    const newStatus = newDue === 0 ? 'Paid' : 'Due';

    const updated = await prisma.invoice.update({
      where: { id: idNum },
      data: {
        paidAmount: newPaid,
        dueAmount: newDue,
        paymentStatus: newStatus,
      },
      include: { items: true, customer: true },
    });

    res.json(formatInvoice(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
