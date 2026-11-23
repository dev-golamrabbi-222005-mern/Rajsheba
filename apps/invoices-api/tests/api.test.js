const http = require('http');

const runTest = async () => {
  // Start server locally for test
  const app = require('../server');

  const makeReq = (path, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port: 5001,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    console.log('Testing GET /api/health...');
    const health = await makeReq('/api/health');
    console.log('Health response:', health.status, health.body);
    if (health.status !== 200) throw new Error('Health check failed');

    console.log('\nTesting POST /api/customers...');
    const newCust = await makeReq('/api/customers', 'POST', {
      name: 'Test Customer',
      phone: '01712345678',
      email: 'test@rajseba.com',
      address: 'Rajshahi, BD'
    });
    console.log('Create Customer response:', newCust.status, newCust.body);
    if (newCust.status !== 201) throw new Error('Customer creation failed');

    console.log('\nTesting GET /api/customers...');
    const custs = await makeReq('/api/customers');
    console.log('Get Customers count:', custs.body.length);

    console.log('\nTesting POST /api/services...');
    const newServ = await makeReq('/api/services', 'POST', {
      name: 'Test AC Repair Service',
      rate: 1200
    });
    console.log('Create Service response:', newServ.status, newServ.body);
    if (newServ.status !== 201) throw new Error('Service creation failed');

    console.log('\nTesting POST /api/invoices...');
    const newInv = await makeReq('/api/invoices', 'POST', {
      invoiceNumber: 'INV-TEST-' + Date.now(),
      date: new Date().toISOString(),
      customer: {
        name: 'Test Customer',
        phone: '01712345678',
        email: 'test@rajseba.com',
        address: 'Rajshahi, BD'
      },
      items: [
        { description: 'Test AC Repair Service', qty: 1, rate: 1200, amount: 1200 }
      ],
      totalAmount: 1200,
      totalPayableAmount: 1200,
      paidAmount: 500,
      dueAmount: 700,
      amountInWords: 'One Thousand Two Hundred Taka Only',
      templateName: 'template1'
    });
    console.log('Create Invoice response:', newInv.status, newInv.body.invoiceNumber);
    if (newInv.status !== 201) throw new Error('Invoice creation failed');

    console.log('\nTesting GET /api/invoices...');
    const invs = await makeReq('/api/invoices');
    console.log('Active invoices count:', invs.body.length);

    console.log('\n✅ All Invoices API Verification Tests Passed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification Test Failed:', err);
    process.exit(1);
  }
};

setTimeout(runTest, 1000);
