import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Seed Roles
  const roles = [
    { name: 'superadmin', description: 'Complete system access' },
    { name: 'admin', description: 'Platform administration' },
    { name: 'agent', description: 'Commission-based booking agent' },
    { name: 'vendor', description: 'Service provider vendor' },
    { name: 'client', description: 'End customer client' },
    { name: 'employee', description: 'Field service employee' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
    });
  }
  console.log('✅ Roles seeded');

  // 2. Seed Superadmin User
  const superadminRole = await prisma.role.findUnique({ where: { name: 'superadmin' } });
  const hashedPassword = await bcrypt.hash('Rajseba@2026!', 10);

  const superadmin = await prisma.user.upsert({
    where: { email: 'admin@rajseba.com' },
    update: {
      roleId: superadminRole?.id,
      roleName: 'superadmin',
    },
    create: {
      name: 'Super Admin',
      email: 'admin@rajseba.com',
      phoneNumber: '01813333373',
      password: hashedPassword,
      roleId: superadminRole?.id,
      roleName: 'superadmin',
      status: 'active',
    },
  });
  console.log('✅ Superadmin user seeded:', superadmin.email);

  // 3. Seed Company Branding
  await prisma.companyBranding.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyName: 'Rajseba',
      email: 'contact@rajseba.com',
      phone: '01813-333373',
      address: 'Rajshahi Corporate Office, Ghoramara, Rajshahi',
      cityLocation: 'Rajshahi',
      metaTitle: 'Rajseba - Best Home Services in Bangladesh',
      metaDescription: 'Trusted home shifting, cleaning, electrical and AC maintenance services.',
      footerDescription: "Bangladesh's leading service marketplace, connecting you with verified professionals for shifting, cleaning, and home maintenance. Fast, safe, and reliable.",
    },
  });
  console.log('✅ Company branding seeded');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
