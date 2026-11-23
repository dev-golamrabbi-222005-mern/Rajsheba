import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatInvoice } from '@/server/invoices/format';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    const where = isNaN(numId) ? { invoiceNumber: id } : { id: numId };

    const invoice = await prisma.invoice.findFirst({
      where,
      include: { items: true, customer: true },
    });

    if (!invoice) return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    return NextResponse.json(formatInvoice(invoice));
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error fetching invoice' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid invoice ID' }, { status: 400 });

    const body = await req.json();
    const { items, customer, ...updateFields } = body;

    const data: any = {};
    if (updateFields.date) data.date = new Date(updateFields.date);
    if (updateFields.templateName) data.templateName = updateFields.templateName;
    if (updateFields.signeeName) data.signeeName = updateFields.signeeName;
    if (updateFields.signeeRole) data.signeeRole = updateFields.signeeRole;
    if (updateFields.notes !== undefined) data.notes = updateFields.notes;
    if (updateFields.totalAmount !== undefined) data.totalAmount = Number(updateFields.totalAmount);
    if (updateFields.totalPayableAmount !== undefined) data.totalPayableAmount = Number(updateFields.totalPayableAmount);
    if (updateFields.paidAmount !== undefined) data.paidAmount = Number(updateFields.paidAmount);
    if (updateFields.dueAmount !== undefined) {
      data.dueAmount = Number(updateFields.dueAmount);
      data.paymentStatus = data.dueAmount === 0 ? 'Paid' : 'Due';
    }

    if (items && Array.isArray(items)) {
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: numId } });
      data.items = {
        create: items.map((item: any) => ({
          description: item.description,
          qty: Number(item.qty || 1),
          rate: Number(item.rate || 0),
          amount: Number(item.amount || (Number(item.qty || 1) * Number(item.rate || 0))),
        })),
      };
    }

    const updated = await prisma.invoice.update({
      where: { id: numId },
      data,
      include: { items: true, customer: true },
    });

    return NextResponse.json(formatInvoice(updated));
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid invoice ID' }, { status: 400 });

    const updated = await prisma.invoice.update({
      where: { id: numId },
      data: { status: 'trashed', deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Invoice moved to trash', invoice: formatInvoice(updated) });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to trash invoice' }, { status: 500 });
  }
}
