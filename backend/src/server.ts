import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { router as healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth.routes";
import { metaRouter } from "./routes/meta.routes";
import { shopifyRouter } from "./routes/shopify.routes";
import { brandRouter } from "./routes/brand.routes";
import { aiRouter } from "./routes/ai.routes";
import { creativeRouter } from "./routes/creative.routes";
import { workStationRouter } from "./routes/work-station.routes";
import { aiChatRouter } from "./routes/ai-chat.routes";
import { errorHandler } from "./middleware/error-handler";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(
  helmet({
    // Allow OAuth popups to call window.opener.postMessage during local dev.
    crossOriginOpenerPolicy: false,
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/meta", metaRouter);
app.use("/api/shopify", shopifyRouter);
app.use("/api/brand", brandRouter);
app.use("/api/ai", aiRouter);
app.use("/api/creatives", creativeRouter);
app.use("/api/work-station", workStationRouter);
app.use("/api/ai-chat", aiChatRouter);

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Meta Ads Platform API" });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${env.PORT}`);
});
