import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface TokenPayload {
  userId: string;
  email: string;
}

export interface MetaStatePayload {
  userId: string;
  nonce: string;
}

export interface MetaTicketPayload {
  user: { id: string; name: string };
  adAccounts: unknown[];
}

export interface ShopifyStatePayload {
  userId: string;
  shopDomain: string;
  nonce: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function signMetaState(payload: MetaStatePayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "10m" });
}

export function verifyMetaState(token: string): MetaStatePayload {
  return jwt.verify(token, env.JWT_SECRET) as MetaStatePayload;
}

export function signMetaTicket(payload: MetaTicketPayload): string {
  return jwt.sign({ payload }, env.JWT_SECRET, { expiresIn: "5m" });
}

export function verifyMetaTicket(token: string): MetaTicketPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as { payload?: MetaTicketPayload };
  if (!decoded?.payload) throw new Error("Invalid ticket");
  return decoded.payload;
}

export function signShopifyState(payload: ShopifyStatePayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "10m" });
}

export function verifyShopifyState(token: string): ShopifyStatePayload {
  return jwt.verify(token, env.JWT_SECRET) as ShopifyStatePayload;
}
