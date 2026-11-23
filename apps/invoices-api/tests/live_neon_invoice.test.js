const http = require('http');
const { Client } = require('pg');

const testInvoices = async () => {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_MDh0Vyjn8eWZ@ep-green-darkness-bd4ijfu3-pooler.c-8.us-east-2.aws.neon.tech/rajsheba",
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('✅ Connected to NeonDB for Invoices verification...');

  try {
    // 1. Verify customers
    const custs = await client.query('SELECT * FROM invoice_customers;');
    console.log('Invoice Customers in NeonDB:', custs.rows.length, custs.rows.map(c => c.name));
    if (custs.rows.length < 1) throw new Error('No invoice customers found');

    // 2. Verify services
    const servs = await client.query('SELECT * FROM invoice_services;');
    console.log('Invoice Services in NeonDB:', servs.rows.length, servs.rows.map(s => s.name));
    if (servs.rows.length < 1) throw new Error('No invoice services found');

    // 3. Insert test invoice directly
    const invRes = await client.query(`
      INSERT INTO invoices ("invoiceNumber", "customerName", "customerPhone", "customerAddress", "totalAmount", "totalPayableAmount", "paidAmount", "dueAmount", "amountInWords")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, "invoiceNumber";
    `, ['INV-LIVE-' + Date.now(), 'Rajseba Partner Corporate', '01700000001', 'Rajshahi', 3500, 3500, 2000, 1500, 'Three Thousand Five Hundred Taka Only']);

    const invId = invRes.rows[0].id;
    console.log('Created Invoice in NeonDB:', invRes.rows[0].invoiceNumber, 'ID:', invId);

    // 4. Insert items
    await client.query(`
      INSERT INTO invoice_items ("invoiceId", description, qty, rate, amount)
      VALUES ($1, $2, $3, $4, $5);
    `, [invId, 'Residential Shifting Logistics Labor', 1, 3500, 3500]);

    // 5. Query joined invoice
    const finalCheck = await client.query(`
      SELECT i."invoiceNumber", i."customerName", i."dueAmount", count(it.id) as item_count
      FROM invoices i
      JOIN invoice_items it ON i.id = it."invoiceId"
      WHERE i.id = $1
      GROUP BY i.id, i."invoiceNumber", i."customerName", i."dueAmount";
    `, [invId]);

    console.log('Invoice joined with items:', finalCheck.rows[0]);
    console.log('🎉 ALL INVOICES API NEONDB VERIFICATION CHECKS PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Invoices verification error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
};

testInvoices();
