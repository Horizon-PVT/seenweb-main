import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import {
  WORKFLOW_DRAFT_TOOL_ID,
  createDefaultWorkflowDraft,
  isWorkflowId,
  normalizeWorkflowDraft,
} from "@/lib/workflow-drafts";

function getDraftName(workflowId: string) {
  return `Workflow Draft: ${workflowId}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email || !(session.user as any).id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = (session.user as any).id as string;
  const workflowId = String(req.method === "GET" ? req.query.workflowId || "" : req.body.workflowId || "");

  if (!isWorkflowId(workflowId)) {
    return res.status(400).json({ error: "Invalid workflowId" });
  }

  if (req.method === "GET") {
    const existing = await prisma.userProject.findFirst({
      where: {
        userId,
        toolId: WORKFLOW_DRAFT_TOOL_ID,
        name: getDraftName(workflowId),
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!existing) {
      const data = createDefaultWorkflowDraft(workflowId);
      return res.status(200).json({
        draft: {
          id: null,
          name: getDraftName(workflowId),
          workflowId,
          data,
          updatedAt: data.updatedAt,
        },
      });
    }

    const data = normalizeWorkflowDraft(workflowId, existing.data);
    return res.status(200).json({
      draft: {
        id: existing.id,
        name: existing.name,
        workflowId,
        data,
        updatedAt: existing.updatedAt.toISOString(),
      },
    });
  }

  if (req.method === "POST") {
    const data = normalizeWorkflowDraft(workflowId, {
      ...req.body.data,
      workflowId,
      updatedAt: new Date().toISOString(),
    });

    const existing = await prisma.userProject.findFirst({
      where: {
        userId,
        toolId: WORKFLOW_DRAFT_TOOL_ID,
        name: getDraftName(workflowId),
      },
      orderBy: { updatedAt: "desc" },
    });

    const project = existing
      ? await prisma.userProject.update({
          where: { id: existing.id },
          data: {
            data,
            updatedAt: new Date(),
          },
        })
      : await prisma.userProject.create({
          data: {
            userId,
            toolId: WORKFLOW_DRAFT_TOOL_ID,
            name: getDraftName(workflowId),
            data,
          },
        });

    return res.status(200).json({
      draft: {
        id: project.id,
        name: project.name,
        workflowId,
        data,
        updatedAt: project.updatedAt.toISOString(),
      },
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
