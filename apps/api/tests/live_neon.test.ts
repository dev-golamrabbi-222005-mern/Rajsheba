import http from 'http';
import { createApp } from '../src/app.js';

const testLiveApi = async () => {
  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(5003, '127.0.0.1', () => resolve());
  });

  const request = (path: string, method = 'GET', headers: any = {}, body: any = null) => {
    return new Promise<{ status: number; body: any }>((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: 5003,
          path,
          method,
          headers: { 'Content-Type': 'application/json', ...headers },
        },
        (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode || 500, body: JSON.parse(data) });
            } catch {
              resolve({ status: res.statusCode || 500, body: data });
            }
          });
        }
      );
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    console.log('--- 1. Testing GET /company-branding (from NeonDB) ---');
    const branding = await request('/company-branding');
    console.log('Branding status:', branding.status, 'Company:', branding.body.data?.companyName);
    if (branding.status !== 200 || branding.body.data?.companyName !== 'Rajseba') {
      throw new Error('Branding test failed');
    }

    console.log('\n--- 2. Testing GET /categories (from NeonDB) ---');
    const categories = await request('/categories');
    console.log('Categories status:', categories.status, 'Total categories:', categories.body.data?.length);
    if (categories.status !== 200 || categories.body.data?.length < 1) {
      throw new Error('Categories test failed');
    }

    console.log('\n--- 3. Testing GET /services (from NeonDB) ---');
    const services = await request('/services');
    console.log('Services status:', services.status, 'Total services:', services.body.data?.length);
    if (services.status !== 200 || services.body.data?.length < 1) {
      throw new Error('Services test failed');
    }

    console.log('\n--- 4. Testing POST /auth/login with seeded superadmin (NeonDB Auth) ---');
    const login = await request('/auth/login', 'POST', {}, {
      identifier: 'admin@rajseba.com',
      password: 'Rajseba@2026!',
    });
    console.log('Login status:', login.status, 'User:', login.body.data?.user?.email, 'Role:', login.body.data?.user?.role);
    if (login.status !== 200 || !login.body.data?.accessToken) {
      throw new Error('Login test failed');
    }

    const token = login.body.data.accessToken;

    console.log('\n--- 5. Testing GET /users/me with JWT Token ---');
    const me = await request('/users/me', 'GET', { Authorization: `Bearer ${token}` });
    console.log('Profile status:', me.status, 'Name:', me.body.data?.name, 'Role:', me.body.data?.role);
    if (me.status !== 200 || me.body.data?.email !== 'admin@rajseba.com') {
      throw new Error('Get profile test failed');
    }

    console.log('\n--- 6. Testing GET /locations/devisions ---');
    const devisions = await request('/locations/devisions');
    console.log('Devisions count:', devisions.body.data?.length);
    if (devisions.status !== 200 || devisions.body.data?.length < 1) {
      throw new Error('Locations test failed');
    }

    console.log('\n🎉 ALL LIVE NEONDB CORE API VERIFICATION TESTS PASSED WITH 100% SUCCESS!');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Live test error:', err);
    server.close();
    process.exit(1);
  }
};

testLiveApi();
