import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatInvoice } from '@/server/invoices/format';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid invoice ID' }, { status: 400 });

    const body = await req.json();
    const { amount, paidAmount } = body;
    const paymentAmount = Number(amount !== undefined ? amount : paidAmount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json({ message: 'Valid payment amount is required' }, { status: 400 });
    }

    const currentInvoice = await prisma.invoice.findUnique({
      where: { id: numId },
      include: { items: true, customer: true },
    });

    if (!currentInvoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    const newPaidAmount = Number(currentInvoice.paidAmount || 0) + paymentAmount;
    const newDueAmount = Math.max(0, Number(currentInvoice.totalPayableAmount || 0) - newPaidAmount);
    const newPaymentStatus = newDueAmount === 0 ? 'Paid' : 'Due';

    const updated = await prisma.invoice.update({
      where: { id: numId },
      data: {
        paidAmount: newPaidAmount,
        dueAmount: newDueAmount,
        paymentStatus: newPaymentStatus,
      },
      include: { items: true, customer: true },
    });

    return NextResponse.json(formatInvoice(updated));
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Payment processing failed' }, { status: 500 });
  }
}
