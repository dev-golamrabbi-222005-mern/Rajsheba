import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatCustomer } from '@/server/invoices/format';

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(customers.map(formatCustomer));
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, address } = body;

    if (!name || !phone || !address) {
      return NextResponse.json({ message: 'Name, phone, and address are required' }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const cleanEmail = email ? email.trim() : null;
    const cleanAddress = address.trim();

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

    return NextResponse.json(formatCustomer(customer), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to upsert customer' }, { status: 400 });
  }
}
