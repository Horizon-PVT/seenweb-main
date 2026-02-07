
// scripts/simulate-payos-webhook.ts
// USAGE: npx ts-node --compiler-options {\"module\":\"commonjs\"} scripts/simulate-payos-webhook.ts <email> <amount>

import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const email = args[0] || 'admin@soibien.com';
    const amount = parseInt(args[1] || '139000');

    console.log(`[SIMULATION] Starting webhook simulation for: ${email}, Amount: ${amount}`);

    // 1. Create a Fake Payment Request in DB (Pending state)
    const orderCode = String(Date.now()).slice(-8);

    // Simulate "Slot Upgrade" payload description
    const planDesc = "Nang cap them 1 slot (YEARLY)";

    const paymentInfo = {
        plan: planDesc,
        role: 'PRO',
        amount: amount,
        note: 'Simulated Slot Upgrade',
        timestamp: new Date().toISOString()
    };

    console.log(`[SIMULATION] Creating PaymentRequest with OrderCode: ${orderCode}`);

    const pr = await prisma.paymentRequest.create({
        data: {
            email: email,
            amount: amount,
            orderCode: orderCode,
            role: 'PRO',
            status: 'PENDING_PAYOS',
            paymentInfo: JSON.stringify(paymentInfo)
        }
    });

    console.log(`[SIMULATION] Created PR ID: ${pr.id}`);

    // 2. Prepare Webhook Payload
    const webhookPayload = {
        code: "00",
        desc: "Success",
        data: {
            orderCode: parseInt(orderCode),
            amount: amount,
            description: planDesc,
            accountNumber: "MBBANK",
            reference: "FT123456",
            transactionDateTime: new Date().toISOString(),
            currency: "VND",
            paymentLinkId: "link123",
            code: "00",
            desc: "Success",
            counterAccountBankId: "",
            counterAccountBankName: "",
            counterAccountName: "",
            counterAccountNumber: "",
            virtualAccountName: "",
            virtualAccountNumber: ""
        },
        signature: "ignored_in_local_test"
    };

    // 3. Send POST to local API
    console.log(`[SIMULATION] Sending Webhook to http://localhost:3000/api/payment/payos-webhook...`);

    try {
        const res = await axios.post('http://localhost:3000/api/payment/payos-webhook', webhookPayload);
        console.log(`[SIMULATION] Response:`, res.data);

        // 4. Verify Database State
        const updatedUser = await prisma.user.findUnique({ where: { email } });
        console.log(`[VERIFICATION] Final User State for ${email}:`);
        console.log(` - Role: ${updatedUser?.role}`);
        console.log(` - Extra Slots: ${updatedUser?.extraChannelSlots}`);
        console.log(` - Credits: ${updatedUser?.dubbingCredits}`);

        if (updatedUser?.extraChannelSlots && updatedUser.extraChannelSlots > 0) {
            console.log("✅ SUCCESS: Extra slots were incremented!");
        } else {
            console.error("❌ FAILURE: Extra slots did not increment.");
        }

    } catch (err: any) {
        console.error("[SIMULATION] Error calling webhook:", err.message);
        if (err.response) {
            console.error(" - Status:", err.response.status);
            console.error(" - Data:", err.response.data);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
