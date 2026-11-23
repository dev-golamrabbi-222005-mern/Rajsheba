export function formatInvoice(inv: any) {
  if (!inv) return null;

  const idStr = String(inv.id || inv._id);
  const items = (inv.items || []).map((item: any) => ({
    description: item.description,
    qty: Number(item.qty || 1),
    rate: Number(item.rate || 0),
    amount: Number(item.amount || (Number(item.qty || 1) * Number(item.rate || 0))),
    _id: item.id ? String(item.id) : item._id,
    id: item.id || item._id,
  }));

  const customerObj = inv.customer && typeof inv.customer === 'object' && inv.customer.name
    ? {
        name: inv.customer.name,
        phone: inv.customer.phone,
        email: inv.customer.email || '',
        address: inv.customer.address,
      }
    : {
        name: inv.customerName || '',
        phone: inv.customerPhone || '',
        email: inv.customerEmail || '',
        address: inv.customerAddress || '',
      };

  const paymentOptionsObj = inv.paymentOptions || {
    accountName: inv.accountName || 'RAJSEBA.COM',
    accountNumber: inv.accountNumber || '02433002451',
    bankName: inv.bankName || 'Bank Asia PLC',
    branch: inv.branch || 'Rajshahi Branch',
    routingNumber: inv.routingNumber || '070811937',
  };

  return {
    ...inv,
    _id: idStr,
    id: inv.id || idStr,
    customer: customerObj,
    items,
    paymentOptions: paymentOptionsObj,
    signeeName: inv.signeeName || 'Ariful Islam Arif',
    signeeRole: inv.signeeRole || 'CEO, Rajseba Design Studio',
    totalAmount: Number(inv.totalAmount || 0),
    totalPayableAmount: Number(inv.totalPayableAmount || inv.totalAmount || 0),
    paidAmount: Number(inv.paidAmount || 0),
    dueAmount: Number(inv.dueAmount || 0),
    paymentStatus: inv.paymentStatus || (Number(inv.dueAmount || 0) === 0 ? 'Paid' : 'Due'),
    status: inv.status || 'active',
  };
}

export function formatCustomer(c: any) {
  if (!c) return null;
  return {
    ...c,
    _id: c._id || String(c.id),
    id: c.id || c._id,
  };
}

export function formatService(s: any) {
  if (!s) return null;
  return {
    ...s,
    _id: s._id || String(s.id),
    id: s.id || s._id,
  };
}
