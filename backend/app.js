import express from "express";
const app = express();

import cookieParser from "cookie-parser";
import cors from "cors";

// Routes imports
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import zoneRoutes from "./routes/zoneRoutes.js";
import "./config/passport.js";
import errorHandleMiddleware from "./middlewares/error.js";
import storefrontRoutes from "./routes/storeFrontRoutes.js";
import partnetshipRoute from "./routes/partnetshipRoute.js";
import { sessionMiddleware, startSessionCleanupJob } from "./middlewares/sessionCleanup.js";
import securityLogsRoutes from "./routes/securityLogsRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";
import { SystemLog } from "./models/systemLogModel.js";
import settingsRoutes from "./routes/settingsRoutes.js"


// ✅ Start cron
startSessionCleanupJob();
// =========================
// ✅ 1. GLOBAL TIMING (FIRST)
// =========================
app.use((req, res, next) => {
  const start = process.hrtime();

  const originalSend = res.send;
  const originalJson = res.json;

  const logRequest = async () => {
    const diff = process.hrtime(start);
    const duration = diff[0] * 1000 + diff[1] / 1e6;

    const time = duration.toFixed(2);
    res.setHeader("X-Response-Time", `${time}ms`);

    // ✅ Skip system routes
    if (req.originalUrl.startsWith("/api/v1/system")) return;

    let type = "normal";

    if (res.statusCode >= 500) type = "error";
    else if (duration > 500) type = "slow";

    if (type !== "normal") {
      await SystemLog.create({
        url: req.originalUrl,
        method: req.method,
        responseTime: duration,
        statusCode: res.statusCode,
        user: req.user?._id || null,
        type,
      }).catch(() => {});
    }

    console.log(`${type === "slow" ? "🐢" : "⚡"} ${req.method} ${req.originalUrl} - ${time}ms`);
  };

  // 🔥 Override send
  res.send = function (body) {
    logRequest();
    return originalSend.call(this, body);
  };

  // 🔥 Override json (THIS WAS MISSING)
  res.json = function (body) {
    logRequest();
    return originalJson.call(this, body);
  };

  next();
});

// =========================
// ✅ 2. OTHER MIDDLEWARE
// =========================
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(cookieParser());

// session AFTER body parsing
app.use(sessionMiddleware);

// =========================
// ✅ 3. ROUTES
// =========================
app.use("/api/v1/storefront", storefrontRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", partnetshipRoute);

app.use("/api/v1", couponRoutes);
app.use("/api/v1", shippingRoutes);
app.use("/api/v1", securityLogsRoutes);
app.use("/api/v1/system", systemRoutes);
app.use("/api/v1/logistics/zones", zoneRoutes);
// Mount settings API
app.use("/api/v1/settings", settingsRoutes);


// =========================
// ✅ 4. ERROR HANDLER
// =========================
app.use(errorHandleMiddleware);

export default app;
