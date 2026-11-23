import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatInvoice } from '@/server/invoices/format';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

    const restored = await prisma.invoice.update({
      where: { id: numId },
      data: { status: 'active', deletedAt: null },
      include: { items: true, customer: true },
    });

    return NextResponse.json({ message: 'Invoice restored successfully', invoice: formatInvoice(restored) });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Restore failed' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params });
}
