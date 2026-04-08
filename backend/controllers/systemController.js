import os from "os";
import mongoose from "mongoose";
import { SystemLog } from "../models/systemLogModel.js";

// =========================
// ✅ SYSTEM HEALTH
// =========================
export const getSystemHealth = async (req, res) => {
  try {
    const start = process.hrtime();

    // 🔹 DB latency
    const dbStart = process.hrtime();
    await mongoose.connection.db.admin().ping();
    const [dbSec, dbNano] = process.hrtime(dbStart);
    const dbTime = dbSec * 1000 + dbNano / 1e6;

    // 🔹 System stats
    const memoryUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    const usedMemMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
    const systemMemUsage = (((totalMem - freeMem) / totalMem) * 100).toFixed(2);
    const cpuLoad = os.loadavg()[0].toFixed(2);

    // 🔹 Controller timing
    const [sec, nano] = process.hrtime(start);
    const controllerTime = sec * 1000 + nano / 1e6;

    res.json({
      status: "healthy",
      uptime: `${Math.floor(process.uptime())}s`,
      serverTime: new Date().toISOString(),

      // performance
      controllerTime: `${controllerTime.toFixed(2)}ms`,
      dbTime: `${dbTime.toFixed(2)}ms`,

      // system
      memory: `${usedMemMB} MB`,
      systemMemoryUsage: `${systemMemUsage}%`,
      cpuLoad,
    });

  } catch (error) {
    console.error("HEALTH ERROR:", error);

    res.status(500).json({
      status: "down",
      message: "System health check failed",
    });
  }
};


// =========================
// ✅ SYSTEM LOGS
// =========================
export const getSystemLogs = async (req, res) => {
  
  try {
    const { type, limit = 20, page = 1 } = req.query;

    const parsedLimit = Math.max(1, Number(limit));
    const parsedPage = Math.max(1, Number(page));

    const query = {};
    if (type) query.type = type;

    let logs;

    // 🔹 Try with populate (safe)
    try {
      logs = await SystemLog.find(query)
        .sort({ createdAt: -1 })
        .limit(parsedLimit)
        .skip((parsedPage - 1) * parsedLimit)
        .populate({
          path: "user",
          select: "name email",
          options: { strictPopulate: false },
        });
    } catch (populateError) {
      console.error("Populate failed, fallback:", populateError.message);

      // 🔹 fallback without populate
      logs = await SystemLog.find(query)
        .sort({ createdAt: -1 })
        .limit(parsedLimit)
        .skip((parsedPage - 1) * parsedLimit);
    }

    const total = await SystemLog.countDocuments(query);

    res.json({
      success: true,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit),
      logs,
    });

  } catch (error) {
    console.error("GET LOGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch system logs",
    });
  }
};
