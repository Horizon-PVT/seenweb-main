// pages/api/admin/payments/approve.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "@/lib/admin";

const prisma = new PrismaClient();

/** Chuẩn hoá tên gói */
function normalizePlan(input: string): "ARCHIVE" | "MAGISTRATE" | "TOANTRI" {
  const s = (input || "").trim().toUpperCase();
  if (s.includes("TOÀN") || s.includes("TOAN") || s.includes("TOANTRI")) return "TOANTRI";
  if (s.includes("MAGI")) return "MAGISTRATE";
  return "ARCHIVE";
}

const planUsageMap: Record<"ARCHIVE" | "MAGISTRATE" | "TOANTRI", number> = {
  ARCHIVE: 200,
  MAGISTRATE: 2000,
  TOANTRI: 10000,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { id, note } = req.body as { id?: string; note?: string };
  if (!id) return res.status(400).json({ error: "Missing id" });

  try {
    const pr = await prisma.paymentRequest.findUnique({ where: { id } });
    if (!pr) return res.status(404).json({ error: "PaymentRequest not found" });

    // Nếu đã duyệt
    if (pr.status === "APPROVED") {
      return res.json({ approved: true, already: true, item: pr });
    }

    const normPlan = normalizePlan(pr.plan);
    const maxDailyUsage = planUsageMap[normPlan];

    const [_, updatedPR] = await prisma.$transaction([
      prisma.user.updateMany({
        where: { email: pr.email },
        data: {
          plan: normPlan,
          maxDailyUsage,
        },
      }),
      prisma.paymentRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedBy: session.user!.email!,
          note: note ?? null,
          plan: normPlan,
        },
      }),
    ]);

    return res.json({
      approved: true,   // 🔥 FE cần field này
      item: updatedPR,
    });
  } catch (err) {
    console.error("Approve error:", err);
    return res.status(500).json({ error: "Internal error approving payment" });
  }
}
