import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import {
  WORKFLOW_DRAFT_TOOL_ID,
  createDefaultWorkflowDraft,
  getLegacyWorkflowDraftName,
  getWorkflowDraftName,
  isWorkflowId,
  normalizeWorkflowDraft,
} from "@/lib/workflow-drafts";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email || !(session.user as any).id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = (session.user as any).id as string;
  const workflowId = String(req.method === "GET" ? req.query.workflowId || "" : req.body.workflowId || "");
  const requestedChannelId = String(req.method === "GET" ? req.query.channelId || "" : req.body.channelId || "");
  const channelId = requestedChannelId.trim() || null;

  if (!isWorkflowId(workflowId)) {
    return res.status(400).json({ error: "Invalid workflowId" });
  }

  if (channelId) {
    const channel = await prisma.youTubeChannel.findFirst({
      where: { id: channelId, userId },
      select: { id: true },
    });

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }
  }

  const draftName = getWorkflowDraftName(workflowId, channelId);

  if (req.method === "GET") {
    const existing = await prisma.userProject.findFirst({
      where: {
        userId,
        toolId: WORKFLOW_DRAFT_TOOL_ID,
        name: channelId ? draftName : { in: [draftName, getLegacyWorkflowDraftName(workflowId)] },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!existing) {
      const data = createDefaultWorkflowDraft(workflowId, channelId);
      return res.status(200).json({
        draft: {
          id: null,
          name: draftName,
          workflowId,
          data,
          updatedAt: data.updatedAt,
        },
      });
    }

    const data = normalizeWorkflowDraft(workflowId, existing.data, channelId);
    return res.status(200).json({
      draft: {
        id: existing.id,
        name: draftName,
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
      channelId,
      updatedAt: new Date().toISOString(),
    }, channelId);

    const existing = await prisma.userProject.findFirst({
      where: {
        userId,
        toolId: WORKFLOW_DRAFT_TOOL_ID,
        name: draftName,
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
            name: draftName,
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
