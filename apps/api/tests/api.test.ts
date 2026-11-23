import http from 'http';
import { createApp } from '../src/app.js';

const runTests = async () => {
  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(5002, '127.0.0.1', () => {
      resolve();
    });
  });

  const makeReq = (path: string, method = 'GET', headers: any = {}, body: any = null) => {
    return new Promise<{ status: number; body: any }>((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port: 5002,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 500, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode || 500, body: data });
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
    console.log('Health status:', health.status, health.body);
    if (health.status !== 200 || health.body.data.status !== 'UP') {
      throw new Error('Health check failed');
    }

    console.log('\nTesting GET / (Root info)...');
    const root = await makeReq('/');
    console.log('Root status:', root.status, root.body.message);
    if (root.status !== 200) throw new Error('Root check failed');

    console.log('\nTesting Protected Route without Token (GET /users/me)...');
    const meNoToken = await makeReq('/users/me');
    console.log('Status code (Expected 401):', meNoToken.status, meNoToken.body.message);
    if (meNoToken.status !== 401) throw new Error('Expected 401 for unauthenticated request');

    console.log('\nTesting Public Branding Route (GET /company-branding)...');
    const branding = await makeReq('/company-branding');
    console.log('Branding status:', branding.status);

    console.log('\nTesting Public Categories Route (GET /categories)...');
    const categories = await makeReq('/categories');
    console.log('Categories status:', categories.status);

    console.log('\nTesting Public Services Route (GET /services)...');
    const services = await makeReq('/services');
    console.log('Services status:', services.status);

    console.log('\n✅ All Rajseba Backend Core API Integration Tests Passed!');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Test execution failed:', err);
    server.close();
    process.exit(1);
  }
};

runTests();
