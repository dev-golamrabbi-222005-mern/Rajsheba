import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

    await prisma.invoiceItem.deleteMany({ where: { invoiceId: numId } });
    await prisma.invoice.delete({ where: { id: numId } });

    return NextResponse.json({ message: 'Invoice permanently deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Force delete failed' }, { status: 500 });
  }
}
