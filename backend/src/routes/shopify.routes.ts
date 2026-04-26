import { Router } from "express";
import { requireSupabaseAuth } from "../middleware/supabase-auth";
import {
  shopifyConnectUrlHandler,
  shopifyDisconnectHandler,
  shopifySalesBreakdownHandler,
  shopifyShopHandler,
  shopifyStatusHandler,
} from "../controllers/shopify.controller";

export const shopifyRouter = Router();

shopifyRouter.post("/connect-url", requireSupabaseAuth, shopifyConnectUrlHandler);
shopifyRouter.get("/status", requireSupabaseAuth, shopifyStatusHandler);
shopifyRouter.get("/shop", requireSupabaseAuth, shopifyShopHandler);
shopifyRouter.get("/sales-breakdown", requireSupabaseAuth, shopifySalesBreakdownHandler);
shopifyRouter.post("/disconnect", requireSupabaseAuth, shopifyDisconnectHandler);
