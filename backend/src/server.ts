import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { router as healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth.routes";
import { errorHandler } from "./middleware/error-handler";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Meta Ads Platform API" });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${env.PORT}`);
});
