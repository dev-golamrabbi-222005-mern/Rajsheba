import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid customer ID' }, { status: 400 });

    await prisma.customer.delete({ where: { id: numId } });
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to delete customer' }, { status: 500 });
  }
}
