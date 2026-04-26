import { Router } from "express";
import { requireSupabaseAuth } from "../middleware/supabase-auth";
import {
  deleteProductHandler,
  getBrandProfileHandler,
  updateColorsHandler,
  updateFontsHandler,
  uploadLogoHandler,
  uploadProductHandler,
} from "../controllers/brand.controller";

export const brandRouter = Router();

brandRouter.get("/profile", requireSupabaseAuth, getBrandProfileHandler);
brandRouter.post("/logo", requireSupabaseAuth, uploadLogoHandler);
brandRouter.post("/product", requireSupabaseAuth, uploadProductHandler);
brandRouter.delete("/product/:id", requireSupabaseAuth, deleteProductHandler);
brandRouter.put("/colors", requireSupabaseAuth, updateColorsHandler);
brandRouter.put("/fonts", requireSupabaseAuth, updateFontsHandler);
