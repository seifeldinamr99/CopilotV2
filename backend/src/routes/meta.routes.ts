import { Router } from "express";
import { requireSupabaseAuth } from "../middleware/supabase-auth";
import {
  metaAdAccountsHandler,
  metaAdsLibrarySearchHandler,
  metaConnectUrlHandler,
  metaDisconnectHandler,
  metaSelectedAdAccountGetHandler,
  metaSelectedAdAccountSetHandler,
  metaSpendBreakdownHandler,
  metaStatusHandler,
  metaTopCampaignsHandler,
} from "../controllers/meta.controller";

export const metaRouter = Router();

metaRouter.get("/status", requireSupabaseAuth, metaStatusHandler);
metaRouter.get("/ad-accounts", requireSupabaseAuth, metaAdAccountsHandler);
metaRouter.get("/selected-ad-account", requireSupabaseAuth, metaSelectedAdAccountGetHandler);
metaRouter.post("/selected-ad-account", requireSupabaseAuth, metaSelectedAdAccountSetHandler);
metaRouter.get("/top-campaigns", requireSupabaseAuth, metaTopCampaignsHandler);
metaRouter.get("/spend-breakdown", requireSupabaseAuth, metaSpendBreakdownHandler);
metaRouter.get("/ads-library/search", requireSupabaseAuth, metaAdsLibrarySearchHandler);
metaRouter.post("/connect-url", requireSupabaseAuth, metaConnectUrlHandler);
metaRouter.post("/disconnect", requireSupabaseAuth, metaDisconnectHandler);
