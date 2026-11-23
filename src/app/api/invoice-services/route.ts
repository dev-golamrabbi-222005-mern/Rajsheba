import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatService } from '@/server/invoices/format';

export async function GET() {
  try {
    const services = await prisma.invoiceService.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(services.map(formatService));
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to fetch invoice services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, rate } = body;

    if (!name || rate === undefined) {
      return NextResponse.json({ message: 'Service name and rate are required' }, { status: 400 });
    }

    const cleanName = name.trim();
    const numericRate = Number(rate);

    const service = await prisma.invoiceService.upsert({
      where: { name: cleanName },
      update: { rate: numericRate },
      create: { name: cleanName, rate: numericRate },
    });

    return NextResponse.json(formatService(service), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to upsert invoice service' }, { status: 400 });
  }
}
