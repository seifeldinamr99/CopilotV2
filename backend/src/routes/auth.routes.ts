import { Router } from "express";
import { registerHandler, loginHandler } from "../controllers/auth.controller";
import {
  metaCallbackHandler,
  metaConnectHandler,
} from "../controllers/meta-auth.controller";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.get("/meta/connect", requireAuth, metaConnectHandler);
authRouter.get("/meta/callback", metaCallbackHandler);
