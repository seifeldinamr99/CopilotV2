import { Router } from "express";
import { requireSupabaseAuth } from "../middleware/supabase-auth";
import {
  createWorkTaskHandler,
  listWorkTasksHandler,
  updateWorkTaskHandler,
} from "../controllers/work-station.controller";

export const workStationRouter = Router();

workStationRouter.get("/tasks", requireSupabaseAuth, listWorkTasksHandler);
workStationRouter.post("/tasks", requireSupabaseAuth, createWorkTaskHandler);
workStationRouter.patch("/tasks/:id", requireSupabaseAuth, updateWorkTaskHandler);
