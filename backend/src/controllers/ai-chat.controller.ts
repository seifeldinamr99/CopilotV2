import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { getOrCreatePortalUser } from "../services/portal-user.service";
import { env } from "../config/env";

const createSessionSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  language: z.string().min(2).max(8).optional(),
});

const createMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
  metaJson: z.record(z.any()).optional(),
});

export async function listChatSessionsHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const sessions = await prisma.portalAIChatSession.findMany({
      where: { portalUserId: portalUser.id },
      orderBy: { lastMessageAt: "desc" },
      take: 50,
    });

    return res.json({ sessions });
  } catch (err) {
    console.error("listChatSessionsHandler error:", err);
    return res.status(503).json({
      message: "Failed to load chat sessions.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function createChatSessionHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const parsed = createSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", details: parsed.error.flatten() });
  }

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const session = await prisma.portalAIChatSession.create({
      data: {
        portalUserId: portalUser.id,
        title: parsed.data.title ?? "New conversation",
        language: parsed.data.language ?? null,
        lastMessageAt: new Date(),
      },
    });

    return res.json({ session });
  } catch (err) {
    console.error("createChatSessionHandler error:", err);
    return res.status(503).json({
      message: "Failed to create chat session.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function listChatMessagesHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const sessionId = typeof req.params.id === "string" ? req.params.id : null;
  if (!sessionId) return res.status(400).json({ message: "Missing session id" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const session = await prisma.portalAIChatSession.findFirst({
      where: { id: sessionId, portalUserId: portalUser.id },
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const messages = await prisma.portalAIChatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    return res.json({ session, messages });
  } catch (err) {
    console.error("listChatMessagesHandler error:", err);
    return res.status(503).json({
      message: "Failed to load chat messages.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function createChatMessageHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const sessionId = typeof req.params.id === "string" ? req.params.id : null;
  if (!sessionId) return res.status(400).json({ message: "Missing session id" });

  const parsed = createMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", details: parsed.error.flatten() });
  }

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const session = await prisma.portalAIChatSession.findFirst({
      where: { id: sessionId, portalUserId: portalUser.id },
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const message = await prisma.portalAIChatMessage.create({
      data: {
        sessionId,
        role: parsed.data.role,
        content: parsed.data.content,
        metaJson: parsed.data.metaJson ?? undefined,
      },
    });

    await prisma.portalAIChatSession.update({
      where: { id: sessionId },
      data: { lastMessageAt: message.createdAt },
    });

    return res.json({ message });
  } catch (err) {
    console.error("createChatMessageHandler error:", err);
    return res.status(503).json({
      message: "Failed to create chat message.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function deleteChatSessionHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const sessionId = typeof req.params.id === "string" ? req.params.id : null;
  if (!sessionId) return res.status(400).json({ message: "Missing session id" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const existing = await prisma.portalAIChatSession.findFirst({
      where: { id: sessionId, portalUserId: portalUser.id },
    });
    if (!existing) return res.status(404).json({ message: "Session not found" });

    await prisma.portalAIChatSession.delete({ where: { id: sessionId } });
    return res.json({ deleted: true });
  } catch (err) {
    console.error("deleteChatSessionHandler error:", err);
    return res.status(503).json({
      message: "Failed to delete chat session.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}
