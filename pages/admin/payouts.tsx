// Trong handler approve payout request
const payout = await prisma.payoutRequest.findUnique({ where: { id: payoutId } });
if (!payout || payout.status !== 'PENDING') return res.status(400).json({ error: 'Invalid' });

// Làm tròn xuống trăm nghìn
const amountApproved = Math.floor(payout.amountRequested.toNumber() / 100000) * 100000;

// Update payout
await prisma.payoutRequest.update({
  where: { id: payoutId },
  data: {
    amountApproved,
    status: 'PAID',
    processedAt: new Date(),
  },
});

// Trừ totalCommission của affiliate (nếu muốn)
await prisma.user.update({
  where: { id: payout.affiliateId },
  data: { totalCommission: { decrement: amountApproved } },
});