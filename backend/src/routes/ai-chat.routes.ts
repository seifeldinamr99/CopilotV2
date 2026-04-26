import { Router } from "express";
import { requireSupabaseAuth } from "../middleware/supabase-auth";
import {
  createChatMessageHandler,
  createChatSessionHandler,
  deleteChatSessionHandler,
  listChatMessagesHandler,
  listChatSessionsHandler,
} from "../controllers/ai-chat.controller";

export const aiChatRouter = Router();

aiChatRouter.get("/sessions", requireSupabaseAuth, listChatSessionsHandler);
aiChatRouter.post("/sessions", requireSupabaseAuth, createChatSessionHandler);
aiChatRouter.get("/sessions/:id/messages", requireSupabaseAuth, listChatMessagesHandler);
aiChatRouter.post("/sessions/:id/messages", requireSupabaseAuth, createChatMessageHandler);
aiChatRouter.delete("/sessions/:id", requireSupabaseAuth, deleteChatSessionHandler);
