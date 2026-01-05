// lib/payos.ts
import PayOS from '@payos/node';

// Create PayOS instance
const payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID!,
    process.env.PAYOS_API_KEY!,
    process.env.PAYOS_CHECKSUM_KEY!
);

export default payOS;
