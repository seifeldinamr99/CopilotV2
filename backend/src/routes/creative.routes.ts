import { Router } from "express";
import { requireSupabaseAuth } from "../middleware/supabase-auth";
import { createCreativeHandler, listCreativesHandler, updateCreativeNameHandler } from "../controllers/creative.controller";

export const creativeRouter = Router();

creativeRouter.get("/", requireSupabaseAuth, listCreativesHandler);
creativeRouter.post("/", requireSupabaseAuth, createCreativeHandler);
creativeRouter.patch("/:id", requireSupabaseAuth, updateCreativeNameHandler);
