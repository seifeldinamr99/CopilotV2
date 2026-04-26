import type { Request, Response } from "express";
import crypto from "crypto";
import { MetaService } from "../services/meta.service";
import { prisma } from "../config/database";
import { encrypt } from "../utils/encryption";
import { signMetaTicket, verifyMetaState, verifyMetaTicket } from "../utils/jwt";
import { getPortalOrigin } from "../config/env";

export async function metaConnectHandler(req: Request, res: Response) {
  const state = crypto.randomBytes(16).toString("hex");
  const url = MetaService.getLoginUrl(state);

  // When used in a popup, avoid async fetch (popup blockers) by redirecting directly.
  if (req.query.redirect === "1") {
    return res.redirect(url);
  }

  return res.json({ url });
}

export async function metaCallbackHandler(req: Request, res: Response) {
  const code = typeof req.query.code === "string" ? req.query.code : null;
  const state = typeof req.query.state === "string" ? req.query.state : null;

  if (!code) return res.status(400).send("Missing code");
  if (!state) return res.status(400).send("Missing state");

  const shortLived = await MetaService.exchangeCodeForToken(code);
  const longLived = await MetaService.exchangeForLongLivedToken(shortLived.accessToken);

  const me = await MetaService.getMe(longLived.accessToken);
  const adAccounts = await MetaService.getAdAccounts(longLived.accessToken);
  const payload = { user: me, adAccounts };

  // If `state` is a signed token created by our backend, persist the encrypted access token for the user.
  try {
    const metaState = verifyMetaState(state);
    await prisma.portalUser.update({
      where: { id: metaState.userId },
      data: { metaAccessToken: encrypt(longLived.accessToken) },
    });
  } catch (err) {
    // Allows "stateless" popup connect flows, but in development we log to make persistence issues obvious.
    if (process.env.NODE_ENV !== "production") {
      console.warn("metaCallbackHandler: failed to persist token from state", err);
    }
    // Ignore: allows "stateless" local popup connect flows that don't have backend auth yet.
  }

  // Prefer a ticket-based flow because some OAuth pages set COOP and sever window.opener.
  const ticket = signMetaTicket(payload);
  const portalOrigin = getPortalOrigin().replace(/\/$/, "");
  return res.redirect(`${portalOrigin}/meta/callback?ticket=${ticket}`);
}

export async function metaTicketHandler(req: Request, res: Response) {
  const ticket = typeof req.query.ticket === "string" ? req.query.ticket : null;
  if (!ticket) return res.status(400).json({ message: "Missing ticket" });

  try {
    return res.json(verifyMetaTicket(ticket));
  } catch {
    return res.status(404).json({ message: "Ticket not found" });
  }
}
