import express from "express";
import { getLogs } from "../controllers/getLogsController.js";


const router = express.Router();

router.get("/", getLogs);

export default router;
