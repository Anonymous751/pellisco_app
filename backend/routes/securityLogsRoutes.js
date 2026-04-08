import express from "express";
import { getLogs } from "../controllers/secutityLogsController.js";


const router = express.Router();

router.get("/logs", getLogs);

export default router;
