import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { getOrCreatePortalUser } from "../services/portal-user.service";
import { env } from "../config/env";

const priorityEnum = z.enum(["Low", "Medium", "High"]);
const windowEnum = z.enum(["Daily", "Weekly", "Monthly"]);

const createSchema = z.object({
  title: z.string().min(1).max(200),
  priority: priorityEnum,
  window: windowEnum,
  deadline: z.string().min(1),
});

const updateSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    priority: priorityEnum.optional(),
    window: windowEnum.optional(),
    deadline: z.string().min(1).optional(),
    completed: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No fields provided" });

function parseDeadline(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid deadline date.");
  }
  return parsed;
}

export async function listWorkTasksHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const tasks = await prisma.portalWorkTask.findMany({
      where: { portalUserId: portalUser.id },
      orderBy: [{ completed: "asc" }, { deadline: "asc" }],
    });

    return res.json({ tasks });
  } catch (err) {
    console.error("listWorkTasksHandler error:", err);
    return res.status(503).json({
      message: "Failed to load tasks.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function createWorkTaskHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", details: parsed.error.flatten() });
  }

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const task = await prisma.portalWorkTask.create({
      data: {
        portalUserId: portalUser.id,
        title: parsed.data.title,
        priority: parsed.data.priority,
        window: parsed.data.window,
        deadline: parseDeadline(parsed.data.deadline),
        completed: false,
      },
    });

    return res.json({ task });
  } catch (err) {
    console.error("createWorkTaskHandler error:", err);
    return res.status(503).json({
      message: "Failed to create task.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function updateWorkTaskHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const taskId = typeof req.params.id === "string" ? req.params.id : null;
  if (!taskId) return res.status(400).json({ message: "Missing task id" });

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", details: parsed.error.flatten() });
  }

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const updates: Record<string, any> = { ...parsed.data };
    if (updates.deadline) {
      updates.deadline = parseDeadline(updates.deadline);
    }

    const task = await prisma.portalWorkTask.update({
      where: { id: taskId, portalUserId: portalUser.id },
      data: updates,
    });

    return res.json({ task });
  } catch (err) {
    console.error("updateWorkTaskHandler error:", err);
    return res.status(503).json({
      message: "Failed to update task.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}
