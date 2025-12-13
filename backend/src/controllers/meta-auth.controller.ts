import type { Request, Response } from "express";
import { prisma } from "../config/database";
import { MetaService } from "../services/meta.service";
import { encrypt } from "../utils/encryption";

export function metaConnectHandler(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const url = MetaService.getLoginUrl(req.user.userId);
  return res.json({ url });
}

export async function metaCallbackHandler(req: Request, res: Response) {
  const { code, state } = req.query as { code?: string; state?: string };
  if (!code || !state) {
    return res.status(400).send("Missing code or state.");
  }

  const user = await prisma.user.findUnique({ where: { id: state } });
  if (!user) {
    return res.status(400).send("Invalid state parameter.");
  }

  try {
    const shortToken = await MetaService.exchangeCodeForToken(code);
    const longToken = await MetaService.exchangeForLongLivedToken(shortToken.accessToken);
    const expiresAt = new Date(Date.now() + longToken.expiresIn * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        metaAccessToken: encrypt(longToken.accessToken),
        metaTokenExpiresAt: expiresAt,
      },
    });

    return res.send("Meta account connected successfully. You can close this window.");
  } catch (error) {
    console.error("Meta OAuth callback failed", error);
    return res.status(500).send("Failed to connect Meta account.");
  }
}
