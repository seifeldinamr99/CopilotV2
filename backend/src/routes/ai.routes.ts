import { Router } from "express";
import { requireSupabaseAuth } from "../middleware/supabase-auth";
import { generateAiImagesHandler } from "../controllers/ai.controller";
import { aiChatHandler, aiExecuteActionHandler } from "../controllers/ai-assistant.controller";

export const aiRouter = Router();

aiRouter.post("/generate", requireSupabaseAuth, generateAiImagesHandler);
aiRouter.post("/chat", requireSupabaseAuth, aiChatHandler);
aiRouter.post("/actions/execute", requireSupabaseAuth, aiExecuteActionHandler);
