import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatInvoice } from '@/server/invoices/format';
import { numberToWords } from '@/utils/numberToWords';

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { status: { not: 'trashed' } },
      include: { items: true, customer: true },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(invoices.map(formatInvoice));
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      invoiceNumber,
      date,
      customer,
      items = [],
      totalAmount = 0,
      totalPayableAmount,
      paidAmount = 0,
      dueAmount,
      templateName = 'InvoiceTemplate1',
      signeeName = 'Ariful Islam Arif',
      signeeRole = 'CEO, Rajseba Design Studio',
      paymentOptions,
      notes,
    } = body;

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return NextResponse.json({ message: 'Customer name, phone, and address are required' }, { status: 400 });
    }

    const cleanPhone = customer.phone.trim();
    const cleanCustomerName = customer.name.trim();
    const cleanCustomerEmail = customer.email ? customer.email.trim() : null;
    const cleanCustomerAddress = customer.address.trim();

    // Upsert customer by phone
    const dbCustomer = await prisma.customer.upsert({
      where: { phone: cleanPhone },
      update: {
        name: cleanCustomerName,
        email: cleanCustomerEmail,
        address: cleanCustomerAddress,
      },
      create: {
        name: cleanCustomerName,
        phone: cleanPhone,
        email: cleanCustomerEmail,
        address: cleanCustomerAddress,
      },
    });

    const numTotal = Number(totalAmount || 0);
    const numPayable = Number(totalPayableAmount !== undefined ? totalPayableAmount : numTotal);
    const numPaid = Number(paidAmount || 0);
    const numDue = Number(dueAmount !== undefined ? dueAmount : Math.max(0, numPayable - numPaid));
    const paymentStatus = numDue === 0 ? 'Paid' : 'Due';

    const generatedInvNumber = invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generatedInvNumber,
        date: date ? new Date(date) : new Date(),
        customerId: dbCustomer.id,
        customerName: cleanCustomerName,
        customerPhone: cleanPhone,
        customerEmail: cleanCustomerEmail,
        customerAddress: cleanCustomerAddress,
        totalAmount: numTotal,
        totalPayableAmount: numPayable,
        paidAmount: numPaid,
        dueAmount: numDue,
        paymentStatus,
        templateName,
        signeeName,
        signeeRole,
        amountInWords: numberToWords(numPayable),
        accountName: paymentOptions?.accountName || null,
        accountNumber: paymentOptions?.accountNumber || null,
        bankName: paymentOptions?.bankName || null,
        branch: paymentOptions?.branch || null,
        routingNumber: paymentOptions?.routingNumber || null,
        status: 'active',
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            qty: Number(item.qty || 1),
            rate: Number(item.rate || 0),
            amount: Number(item.amount || (Number(item.qty || 1) * Number(item.rate || 0))),
          })),
        },
      },
      include: { items: true, customer: true },
    });

    return NextResponse.json(formatInvoice(newInvoice), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to create invoice' }, { status: 400 });
  }
}
