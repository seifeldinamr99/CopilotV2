import { Router } from "express";
import { registerHandler, loginHandler } from "../controllers/auth.controller";
import { metaCallbackHandler, metaConnectHandler, metaTicketHandler } from "../controllers/meta-auth.controller";
import { shopifyCallbackHandler } from "../controllers/shopify.controller";

export const authRouter = Router();

authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.get("/meta/connect", metaConnectHandler);
authRouter.get("/meta/callback", metaCallbackHandler);
authRouter.get("/meta/ticket", metaTicketHandler);
authRouter.get("/shopify/callback", shopifyCallbackHandler);

