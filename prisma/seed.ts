import { Client } from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = "postgresql://neondb_owner:npg_MDh0Vyjn8eWZ@ep-green-darkness-bd4ijfu3-pooler.c-8.us-east-2.aws.neon.tech/rajsheba";

async function seed() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('✅ Connected to NeonDB for comprehensive seeding...');

  try {
    // 1. Seed Roles
    const roles = [
      ['superadmin', 'Complete system access'],
      ['admin', 'Platform administrator'],
      ['agent', 'Commission-based booking agent'],
      ['vendor', 'Verified service provider vendor'],
      ['client', 'Registered customer client'],
      ['employee', 'Field service professional'],
    ];

    for (const [name, desc] of roles) {
      await client.query(
        `INSERT INTO roles (name, description, "createdAt", "updatedAt")
         VALUES ($1, $2, NOW(), NOW())
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;`,
        [name, desc]
      );
    }
    console.log('✅ Roles seeded');

    // 2. Seed Users
    const hashedPassword = await bcrypt.hash('Rajseba@2026!', 10);
    const superadminRes = await client.query(`SELECT id FROM roles WHERE name = 'superadmin' LIMIT 1;`);
    const superadminRoleId = superadminRes.rows[0]?.id;

    const vendorRes = await client.query(`SELECT id FROM roles WHERE name = 'vendor' LIMIT 1;`);
    const vendorRoleId = vendorRes.rows[0]?.id;

    // Superadmin
    await client.query(
      `INSERT INTO users (name, email, "phoneNumber", password, "roleId", "roleName", status, address, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, "roleName" = EXCLUDED."roleName";`,
      ['Super Admin', 'admin@rajseba.com', '01813333373', hashedPassword, superadminRoleId, 'superadmin', 'active', 'Rajshahi Corporate Office']
    );

    // Verified Vendor
    const vendorInsert = await client.query(
      `INSERT INTO users (name, email, "phoneNumber", password, "roleId", "roleName", status, address, "commissionRate", balance, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET "roleName" = EXCLUDED."roleName"
       RETURNING id;`,
      ['Rajseba Master Vendor', 'vendor@rajseba.com', '01711223344', hashedPassword, vendorRoleId, 'vendor', 'active', 'Ghoramara, Rajshahi', 10, 5000]
    );
    const vendorId = vendorInsert.rows[0]?.id;
    console.log('✅ Users seeded (Superadmin & Vendor)');

    // 3. Seed Company Branding
    await client.query(
      `INSERT INTO company_branding (id, "companyName", "logoUrl", "footerLogoUrl", email, phone, address, "cityLocation", "metaTitle", "metaDescription", "footerDescription", "createdAt", "updatedAt")
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET "companyName" = EXCLUDED."companyName", phone = EXCLUDED.phone;`,
      [
        'Rajseba',
        '/rajshiblogo.png',
        '/logo.png',
        'contact@rajseba.com',
        '01813-333373',
        'Rajshahi Corporate Office, Ghoramara, Rajshahi',
        'Rajshahi',
        'Rajseba - Leading Home & Commercial Services Marketplace in Bangladesh',
        'Verified local experts for shifting, home maintenance, cleaning, and electrical services.',
        "Bangladesh's leading service marketplace, connecting you with verified professionals for shifting, cleaning, and home maintenance. Fast, safe, and reliable.",
      ]
    );
    console.log('✅ Company branding seeded');

    // 4. Seed Categories
    const categories = [
      ['Home Shifting', 'home-shifting', 'Full house shifting and commercial relocation with packing and moving', 'FaTruck', 1],
      ['AC Servicing', 'ac-servicing', 'Complete AC repair, gas refill, installation and chemical cleaning', 'FaSnowflake', 2],
      ['Deep Cleaning', 'deep-cleaning', 'Home deep cleaning, sofa and carpet shampooing and water tank cleaning', 'FaBroom', 3],
      ['Plumbing & Sanitary', 'plumbing-sanitary', 'Pipe leakage fixing, basin installation, and bathroom fittings', 'FaWrench', 4],
      ['Electrical & Appliances', 'electrical-appliances', 'Circuit breaker repair, house wiring, ceiling fan and microwave repair', 'FaBolt', 5],
      ['Painting & Renovation', 'painting-renovation', 'Interior/exterior wall painting, waterproofing, and gypsum false ceiling', 'FaPaintRoller', 6],
    ];

    const categoryMap = new Map();
    for (const [name, slug, desc, icon, order] of categories) {
      const res = await client.query(
        `INSERT INTO categories (name, slug, description, icon, "order", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
         RETURNING id;`,
        [name, slug, desc, icon, order]
      );
      categoryMap.set(slug, res.rows[0]?.id);
    }
    console.log('✅ Categories seeded');

    // 5. Seed Core Services
    const shiftingCatId = categoryMap.get('home-shifting');
    const acCatId = categoryMap.get('ac-servicing');
    const cleaningCatId = categoryMap.get('deep-cleaning');

    const services = [
      [
        'Family Home Shifting Service',
        'family-home-shifting',
        'Stress-free moving with professional packaging, loading, transport, and unloading.',
        shiftingCatId,
        '/home-shifting.jpg',
        JSON.stringify([
          { question: 'Do you provide packing materials?', answer: 'Yes, we bring cartons, bubble wrap, stretch film, and packing tape.' },
          { question: 'Is loading and unloading included?', answer: 'Yes, trained labor handles all lifting, stair carrying, and placement.' }
        ])
      ],
      [
        'Master AC Jet-Wash Cleaning',
        'master-ac-jet-wash-cleaning',
        'Deep chemical foam cleaning with high-pressure water pump for maximum cooling efficiency.',
        acCatId,
        '/ac-cleaning.jpg',
        JSON.stringify([
          { question: 'How long does AC jet wash take?', answer: 'It takes around 45 to 60 minutes per indoor and outdoor unit.' }
        ])
      ],
      [
        'Full Apartment Deep Cleaning',
        'full-apartment-deep-cleaning',
        'Complete corner-to-corner sanitization, floor scrubbing, and kitchen grease removal.',
        cleaningCatId,
        '/cleaning.jpg',
        JSON.stringify([
          { question: 'What chemicals do you use?', answer: 'We use eco-friendly hospital-grade disinfectant and certified degreasers.' }
        ])
      ],
    ];

    for (const [name, slug, desc, catId, img, faq] of services) {
      const sRes = await client.query(
        `INSERT INTO services (name, slug, description, "categoryId", "vendorId", image, faq, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description
         RETURNING id;`,
        [name, slug, desc, catId, vendorId, img, faq]
      );
      const serviceId = sRes.rows[0]?.id;

      // Seed Packages for this service
      await client.query(
        `INSERT INTO packages ("serviceId", name, price, description, features, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT DO NOTHING;`,
        [
          serviceId,
          'Standard Package',
          2500,
          'Essential service for standard 2-3 room homes',
          JSON.stringify(['2-3 Experts', 'Standard equipment', '7 Days service warranty']),
        ]
      );

      await client.query(
        `INSERT INTO packages ("serviceId", name, price, description, features, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT DO NOTHING;`,
        [
          serviceId,
          'Premium VIP Package',
          5000,
          'Complete all-inclusive service with premium insurance',
          JSON.stringify(['4-5 Certified Experts', 'High-grade tools & materials', '30 Days guarantee', 'Damage Protection']),
        ]
      );
    }
    console.log('✅ Services and Packages seeded');

    // 6. Seed Locations (Divisions & Districts)
    const divisions = [
      ['Dhaka', 'ঢাকা', 'DHK'],
      ['Rajshahi', 'রাজশাহী', 'RAJ'],
      ['Chittagong', 'চট্টগ্রাম', 'CTG'],
      ['Sylhet', 'সিলেট', 'SYL'],
      ['Khulna', 'খুলনা', 'KHL'],
    ];

    for (const [name, bangla, code] of divisions) {
      const dRes = await client.query(
        `INSERT INTO devisions (name, "banglaName", code)
         VALUES ($1, $2, $3)
         RETURNING id;`,
        [name, bangla, code]
      );
      const divId = dRes.rows[0]?.id;

      if (name === 'Rajshahi') {
        const distRes = await client.query(
          `INSERT INTO districts (name, "banglaName", code, "devisionId")
           VALUES ($1, $2, $3, $4) RETURNING id;`,
          ['Rajshahi', 'রাজশাহী', 'RAJ-DIST', divId]
        );
        const distId = distRes.rows[0]?.id;

        await client.query(
          `INSERT INTO areas (name, "banglaName", "districtId") VALUES
           ('Ghoramara', 'ঘোড়ামারা', $1),
           ('Motihar', 'মতিহার', $1),
           ('Boalia', 'বোয়ালিয়া', $1),
           ('Rajpara', 'রাজপাড়া', $1),
           ('Upashahar', 'উপশহর', $1);`,
          [distId]
        );
      }
    }
    console.log('✅ Locations (Divisions, Districts, Areas) seeded');

    // 7. Seed Active Coupons
    await client.query(
      `INSERT INTO coupons (code, description, "discountType", "discountValue", "minOrderAmount", "isActive", "applicableTo", "createdAt", "updatedAt")
       VALUES
       ('RAJSEBA100', 'Special promotional flat 100 Taka discount', 'fixed', 100, 1000, true, 'all', NOW(), NOW()),
       ('WELCOME10', 'Welcome 10% discount on first service booking', 'percentage', 10, 500, true, 'all', NOW(), NOW())
       ON CONFLICT (code) DO NOTHING;`
    );
    console.log('✅ Coupons seeded');

    // 8. Seed Invoice Services and Customers for apps/invoices-api
    await client.query(
      `INSERT INTO invoice_customers (name, phone, email, address, "createdAt", "updatedAt")
       VALUES
       ('Rajseba Partner Corporate', '01700000001', 'partner@rajseba.com', 'Ghoramara, Rajshahi', NOW(), NOW()),
       ('Green Valley Tech', '01700000002', 'contact@greenvalley.com', 'Uttara, Dhaka', NOW(), NOW())
       ON CONFLICT (phone) DO NOTHING;`
    );

    await client.query(
      `INSERT INTO invoice_services (name, rate, "createdAt", "updatedAt")
       VALUES
       ('Commercial AC Jet Wash Cleaning', 1800, NOW(), NOW()),
       ('Residential Shifting Logistics Labor', 3500, NOW(), NOW()),
       ('Full Office Disinfection Service', 5000, NOW(), NOW())
       ON CONFLICT (name) DO NOTHING;`
    );
    console.log('✅ Invoices API sample customers and services seeded');

    console.log('\n🎉 ALL RAJSHEBA REMAINING DATABASE DATA SEEDED SUCCESSFULLY IN NEONDB!');
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
