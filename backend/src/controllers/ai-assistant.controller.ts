import type { Request, Response } from "express";
import axios from "axios";
import { z } from "zod";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { getOrCreatePortalUser } from "../services/portal-user.service";
import { MetaService } from "../services/meta.service";
import { decrypt } from "../utils/encryption";

const chatSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1),
  language: z.string().min(2).max(8).optional(),
});

const actionSchema = z.object({
  sessionId: z.string().optional(),
  action: z.string().min(1),
  params: z.record(z.any()),
  reason: z.string().optional(),
});

const allowedActions = new Set([
  "meta.pause_campaign",
  "meta.enable_campaign",
  "meta.adjust_budget",
  "meta.change_bid_strategy",
  "meta.toggle_ad_set",
  "meta.toggle_ad",
]);

function computeSinceUntil(range: string) {
  const now = new Date();
  const until = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const since = new Date(until);
  const subDays = (days: number) => since.setUTCDate(since.getUTCDate() - days);
  switch (range) {
    case "today":
      break;
    case "last_month":
      subDays(30);
      break;
    case "last_3_months":
      subDays(90);
      break;
    case "last_6_months":
      subDays(180);
      break;
    case "last_year":
      subDays(365);
      break;
    default:
      subDays(14);
  }
  return { since: since.toISOString().slice(0, 10), until: until.toISOString().slice(0, 10) };
}

function detectRangeFromMessage(message: string): string | null {
  const normalized = message.toLowerCase();
  if (normalized.includes("today")) return "today";
  if (normalized.includes("last 14")) return "last_14_days";
  if (normalized.includes("last month")) return "last_month";
  if (normalized.includes("last 3 months") || normalized.includes("last 3")) return "last_3_months";
  if (normalized.includes("last 6 months") || normalized.includes("last 6")) return "last_6_months";
  if (normalized.includes("last year")) return "last_year";
  return null;
}

function mapAdAccounts(accounts: Array<{ id: string; name: string; account_id?: string; currency?: string; timezone_name?: string }>) {
  return accounts.map((account) => ({
    id: account.id,
    name: account.name,
    account_id: account.account_id ?? null,
    currency: account.currency ?? null,
    timezone_name: account.timezone_name ?? null,
  }));
}

async function buildContext(params: {
  portalUserId: string;
  metaAccessToken?: string | null;
  metaSelectedAdAccountId?: string | null;
  overrideAdAccountId?: string | null;
  adAccounts?: Array<{ id: string; name: string; account_id?: string | null; currency?: string | null; timezone_name?: string | null }>;
  range?: string | null;
  skipInsights?: boolean;
}) {
  const {
    metaAccessToken,
    metaSelectedAdAccountId,
    overrideAdAccountId,
    adAccounts,
    range,
    skipInsights,
  } = params;
  const accessToken = metaAccessToken ? decrypt(metaAccessToken) : null;
  const context: Record<string, any> = {
    meta: { connected: Boolean(metaAccessToken), adAccountId: metaSelectedAdAccountId ?? null },
  };

  let resolvedAdAccountId = overrideAdAccountId ?? metaSelectedAdAccountId ?? null;
  if (adAccounts?.length) {
    context.meta.adAccounts = adAccounts;
    resolvedAdAccountId = resolvedAdAccountId ?? adAccounts[0]?.id ?? null;
    const selected = adAccounts.find((account) => account.id === resolvedAdAccountId);
    context.meta.adAccountName = selected?.name ?? null;
  } else if (accessToken && !resolvedAdAccountId) {
    try {
      const accounts = await MetaService.getAdAccounts(accessToken);
      const mappedAccounts = mapAdAccounts(accounts);
      context.meta.adAccounts = mappedAccounts;
      resolvedAdAccountId = resolvedAdAccountId ?? accounts[0]?.id ?? accounts[0]?.account_id ?? null;
      const selected = mappedAccounts.find((account) => account.id === resolvedAdAccountId);
      context.meta.adAccountName = selected?.name ?? null;
    } catch (err) {
      context.meta.adAccountsError = String((err as any)?.message ?? err);
    }
  } else if (accessToken) {
    try {
      const accounts = await MetaService.getAdAccounts(accessToken);
      const mappedAccounts = mapAdAccounts(accounts);
      context.meta.adAccounts = mappedAccounts;
      const selected = mappedAccounts.find((account) => account.id === resolvedAdAccountId);
      context.meta.adAccountName = selected?.name ?? null;
    } catch (err) {
      context.meta.adAccountsError = String((err as any)?.message ?? err);
    }
  }

  if (accessToken && resolvedAdAccountId && !skipInsights) {
    try {
      const { since, until } = computeSinceUntil(range ?? "today");
      const topCampaigns = await MetaService.getTopCampaignsByRoas({
        accessToken,
        adAccountId: resolvedAdAccountId,
        since,
        until,
        limit: 5,
      });
      context.meta.adAccountId = resolvedAdAccountId;
      context.meta.topCampaigns = topCampaigns;

      const [campaigns, adSets, ads] = await Promise.all([
        MetaService.getSpendBreakdown({
          accessToken,
          adAccountId: resolvedAdAccountId,
          since,
          until,
          level: "campaign",
          limit: 10,
        }),
        MetaService.getSpendBreakdown({
          accessToken,
          adAccountId: resolvedAdAccountId,
          since,
          until,
          level: "adset",
          limit: 10,
        }),
        MetaService.getSpendBreakdown({
          accessToken,
          adAccountId: resolvedAdAccountId,
          since,
          until,
          level: "ad",
          limit: 10,
        }),
      ]);
      context.meta.spendBreakdown = { campaigns, adSets, ads };
    } catch (err) {
      context.meta.topCampaignsError = String((err as any)?.message ?? err);
    }
  }

  return context;
}

async function callGemini(prompt: string) {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is required");
  const rawModel = env.GEMINI_MODEL ?? "gemini-1.5-flash";
  const model = rawModel.replace(/^models\//, "");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

  const { data } = await axios.post(
    url,
    {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4 },
    },
    { headers: { "Content-Type": "application/json" } },
  );

  const text =
    data?.candidates?.[0]?.content?.parts?.map((part: any) => part?.text ?? "").join("") ?? "";
  return text.trim();
}

export async function aiChatHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", details: parsed.error.flatten() });
  }

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const stored = await prisma.portalUser.findUnique({
      where: { id: portalUser.id },
      select: {
        metaAccessToken: true,
        metaSelectedAdAccountId: true,
      },
    });

    let sessionId = parsed.data.sessionId ?? null;
    if (!sessionId) {
      const session = await prisma.portalAIChatSession.create({
        data: {
          portalUserId: portalUser.id,
          title: parsed.data.message.slice(0, 80),
          language: parsed.data.language ?? null,
          lastMessageAt: new Date(),
        },
      });
      sessionId = session.id;
    }

    const session = await prisma.portalAIChatSession.findFirst({
      where: { id: sessionId, portalUserId: portalUser.id },
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const userMessage = await prisma.portalAIChatMessage.create({
      data: { sessionId, role: "user", content: parsed.data.message },
    });

    if (!session.title || session.title === "New conversation") {
      await prisma.portalAIChatSession.update({
        where: { id: sessionId },
        data: { title: parsed.data.message.slice(0, 80) },
      });
    }

    const history = await prisma.portalAIChatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    const recent = history.reverse().map((msg) => `${msg.role}: ${msg.content}`).join("\n");

    const accessToken = stored?.metaAccessToken ? decrypt(stored.metaAccessToken) : null;
    const accounts = accessToken ? await MetaService.getAdAccounts(accessToken) : [];
    const mappedAccounts = mapAdAccounts(accounts);
    const requestedRange = detectRangeFromMessage(parsed.data.message) ?? "last_month";

    let selectedAdAccountId = stored?.metaSelectedAdAccountId ?? null;
    let finalRange = requestedRange;
    if (mappedAccounts.length) {
      const accountPrompt = [
        "Pick the best matching ad account for the user message.",
        "Return exactly two lines:",
        "ACCOUNT_ID=<id or empty>",
        "RANGE=<today|last_14_days|last_month|last_3_months|last_6_months|last_year>",
        "",
        "Accounts:",
        ...mappedAccounts.map((account) => `- ${account.name} (id: ${account.id})`),
        "",
        `User message: ${parsed.data.message}`,
      ].join("\n");
      const selectionRaw = await callGemini(accountPrompt);
      const accountMatch = selectionRaw.match(/ACCOUNT_ID\s*=\s*([^\n\r]+)/i);
      const rangeMatch = selectionRaw.match(/RANGE\s*=\s*([a-z0-9_]+)/i);
      const accountValue = accountMatch?.[1]?.trim() ?? "";
      const rangeValue = rangeMatch?.[1]?.trim() ?? "";
      if (accountValue) {
        const accountValueLower = accountValue.toLowerCase();
        const direct = mappedAccounts.find((account) => account.id === accountValue);
        const byName = mappedAccounts.find((account) => account.name.toLowerCase() === accountValueLower);
        const partial = mappedAccounts.find((account) => account.name.toLowerCase().includes(accountValueLower));
        selectedAdAccountId = (direct ?? byName ?? partial)?.id ?? selectedAdAccountId;
      }
      if (rangeValue) {
        const normalized = rangeValue.toLowerCase();
        if (
          ["today", "last_14_days", "last_month", "last_3_months", "last_6_months", "last_year"].includes(normalized)
        ) {
          finalRange = normalized;
        }
      }
    }

    const context = await buildContext({
      portalUserId: portalUser.id,
      metaAccessToken: stored?.metaAccessToken ?? null,
      metaSelectedAdAccountId: stored?.metaSelectedAdAccountId ?? null,
      overrideAdAccountId: selectedAdAccountId,
      adAccounts: mappedAccounts.length ? mappedAccounts : undefined,
      range: finalRange,
      skipInsights: false,
    });
    const prompt = [`Context:\n${JSON.stringify(context)}`, "", `Conversation:\n${recent}\nassistant:`].join("\n");

    const raw = await callGemini(prompt);
    const assistantText = raw.trim();
    const actions: any[] = [];

    const assistantMessage = await prisma.portalAIChatMessage.create({
      data: { sessionId, role: "assistant", content: assistantText, metaJson: { actions } },
    });

    await prisma.portalAIChatSession.update({
      where: { id: sessionId },
      data: { lastMessageAt: assistantMessage.createdAt },
    });

    return res.json({
      sessionId,
      userMessage,
      assistantMessage,
      actions,
    });
  } catch (err) {
    console.error("aiChatHandler error:", err);
    return res.status(503).json({
      message: "Failed to process AI chat.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function aiExecuteActionHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const parsed = actionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", details: parsed.error.flatten() });
  }

  const { sessionId, action, params, reason } = parsed.data;
  if (!allowedActions.has(action)) {
    return res.status(400).json({ message: "Action not allowed" });
  }

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const actionLog = await prisma.portalAIActionLog.create({
      data: {
        portalUserId: portalUser.id,
        sessionId: sessionId ?? null,
        action,
        paramsJson: params,
        status: "requested",
        error: reason ?? null,
      },
    });

    return res.json({ actionLog, status: "queued" });
  } catch (err) {
    console.error("aiExecuteActionHandler error:", err);
    return res.status(503).json({
      message: "Failed to execute action.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}
