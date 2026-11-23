import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatInvoice } from '@/server/invoices/format';

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { status: 'trashed' },
      include: { items: true, customer: true },
      orderBy: [{ deletedAt: 'desc' }, { date: 'desc' }],
    });

    return NextResponse.json(invoices.map(formatInvoice));
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to fetch trashed invoices' }, { status: 500 });
  }
}
