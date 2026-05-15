import axios from "axios";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { USAGE_LIMITS, isValidToolRole } from "@/lib/roles";
import { sendMasterclassWelcomeEmail } from "@/lib/email";

type ProcessPaidPaymentInput = {
  orderCode: string | number;
  txn?: string | null;
};

type PaymentInfo = {
  plan?: string;
  role?: string;
  referralCode?: string | null;
  billingCycle?: string;
  membershipDays?: number | null;
  hasMasterclass?: boolean;
  isSlotUpgrade?: boolean;
  extraChannelSlots?: number;
};

function parsePaymentInfo(raw: string | null): PaymentInfo {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as PaymentInfo;
  } catch {
    return {};
  }
}

function getMembershipDays(info: PaymentInfo): number | null {
  if (typeof info.membershipDays === "number") return info.membershipDays;
  const cycle = String(info.billingCycle || "MONTHLY").toUpperCase();
  if (cycle === "YEARLY") return 365;
  if (cycle === "SIX_MONTHS") return 180;
  return 30;
}

function getDubbingCredits(role: string): number {
  if (["STARTER", "BASIC"].includes(role)) return 10;
  if (["CREATOR", "PRO"].includes(role)) return 30;
  if (role === "FACTORY") return 50;
  if (["AGENCY", "ENTERPRISE"].includes(role)) return 100;
  return 0;
}

export async function processPaidPayment({ orderCode, txn = null }: ProcessPaidPaymentInput) {
  const paymentRequest = await prisma.paymentRequest.findUnique({
    where: { orderCode: String(orderCode) },
  });

  if (!paymentRequest) {
    return { processed: false, reason: "ORDER_NOT_FOUND" as const, user: null, licenseKey: null };
  }

  if (paymentRequest.status === "PAID") {
    const user = await prisma.user.findFirst({
      where: { email: { equals: paymentRequest.email, mode: "insensitive" } },
    });
    return { processed: false, reason: "ALREADY_PAID" as const, user, licenseKey: user?.kodaLicenseKey || null };
  }

  const info = parsePaymentInfo(paymentRequest.paymentInfo);
  const normalizedEmail = paymentRequest.email.trim().toLowerCase();
  const role = String(info.role || paymentRequest.role).toUpperCase();
  const hasMasterclass = info.hasMasterclass === true || role === "MASTERCLASS";
  const isSlotUpgrade = info.isSlotUpgrade === true;
  const extraSlotsToAdd = isSlotUpgrade ? Number(info.extraChannelSlots || 1) : 0;
  const membershipDays = hasMasterclass && !isValidToolRole(role) ? null : getMembershipDays(info);
  const toolRole = isValidToolRole(role) && role !== "FREE" && role !== "ADMIN" ? role : null;
  const dubbingCreditsToAdd = toolRole ? getDubbingCredits(toolRole) : 0;

  let user = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
  });

  if (!user) {
    const initialRole = isSlotUpgrade ? "CREATOR" : toolRole || "FREE";
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        role: initialRole,
        hasMasterclass,
        extraChannelSlots: isSlotUpgrade ? extraSlotsToAdd : 0,
        membershipExpiry: membershipDays ? new Date(Date.now() + membershipDays * 24 * 60 * 60 * 1000) : null,
        dubbingCredits: dubbingCreditsToAdd,
        maxDailyUsage: USAGE_LIMITS[initialRole as keyof typeof USAGE_LIMITS] || 3,
      },
    });
  } else {
    const updateData: Prisma.UserUpdateInput = {};

    if (hasMasterclass) {
      updateData.hasMasterclass = true;
    }

    if (isSlotUpgrade) {
      updateData.extraChannelSlots = { increment: extraSlotsToAdd };
    } else if (toolRole) {
      const currentExpiry = user.membershipExpiry || new Date();
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
      const days = membershipDays || 30;

      updateData.role = toolRole;
      updateData.membershipExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
      updateData.dubbingCredits = { increment: dubbingCreditsToAdd };
      updateData.maxDailyUsage = USAGE_LIMITS[toolRole as keyof typeof USAGE_LIMITS] || 3;
    }

    user = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
  }

  await prisma.paymentRequest.update({
    where: { id: paymentRequest.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      userId: user.id,
      txn,
    },
  });

  if (info.referralCode) {
    try {
      const referrer = await prisma.user.findUnique({
        where: { affiliateCode: String(info.referralCode) },
      });

      if (referrer && referrer.id !== user.id) {
        const commissionRate = parseFloat(process.env.AFF_RATE_NEW || "0.30");
        const commissionAmount = paymentRequest.amount * commissionRate;

        await prisma.commission.create({
          data: {
            referrerId: referrer.id,
            referredUserId: user.id,
            paymentRequestId: paymentRequest.id,
            type: "NEW",
            amount: commissionAmount,
            status: "APPROVED",
            approvedAt: new Date(),
          },
        });

        await prisma.user.update({
          where: { id: referrer.id },
          data: { totalCommission: { increment: commissionAmount } },
        });
      }
    } catch (err) {
      console.error("[Payment] Error processing commission:", err);
    }
  }

  if (hasMasterclass) {
    try {
      const userName = user.name || user.email.split("@")[0];
      await sendMasterclassWelcomeEmail(user.email, userName);
    } catch (emailErr) {
      console.error("[Payment] Failed to send Masterclass welcome email:", emailErr);
    }
  }

  let generatedLicenseKey: string | null = null;
  const plansWithLicense = ["CREATOR", "FACTORY", "AGENCY", "ENTERPRISE"];

  if (toolRole && plansWithLicense.includes(toolRole)) {
    try {
      let vpsTier = "creator";
      if (toolRole === "FACTORY") vpsTier = "factory";
      if (toolRole === "AGENCY") vpsTier = "agency";
      if (toolRole === "ENTERPRISE") vpsTier = "enterprise";

      const vpsResponse = await axios.post(
        "http://47.250.174.44/api/admin/create-license",
        {
          adminSecret: process.env.KODA_LICENSE_ADMIN_SECRET || "koda-admin-2026",
          tier: vpsTier,
          owner: `${paymentRequest.email} (Web Auto)`,
          expiresInDays: membershipDays || 30,
        },
        { timeout: 10000 },
      );

      if (vpsResponse.data?.success && vpsResponse.data?.licenseKey) {
        generatedLicenseKey = vpsResponse.data.licenseKey;
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            kodaLicenseKey: generatedLicenseKey,
            kodaTier: vpsTier,
          },
        });
      }
    } catch (licErr: any) {
      console.error("[Payment] Failed to generate license from VPS:", licErr.message);
    }
  }

  return { processed: true, reason: "PROCESSED" as const, user, licenseKey: generatedLicenseKey };
}

