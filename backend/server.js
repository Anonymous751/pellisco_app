import app from "./app.js";
import dotenv from "dotenv";
import { connectMongodbDatabase } from "./config/db.js";
import cloudinaryConfig from "./config/cloudinary.js";
import { initSocket } from "./socket.js";

dotenv.config({ path: "backend/config/config.env" });

connectMongodbDatabase();
cloudinaryConfig();

// CORS
import cors from "cors";

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));


app.set("query parser", "extended");

// Uncaught Exception
process.on("uncaughtException", (err)=> {
  console.log(`Error, ${err.message}`);
  process.exit(1);
});

const port = process.env.PORT || 1552;

// ✅ CREATE HTTP SERVER (IMPORTANT)
import http from "http";
const server = http.createServer(app);

// ✅ INIT SOCKET HERE
initSocket(server);

// Start server
server.listen(port, () => {
  console.log(`Server is Running on Port No. ${port}`);
});

// Unhandled Rejection
process.on('unhandledRejection', (err)=> {
  console.log(`Error: ${err.message}`);
  server.close(()=> {
    process.exit(1);
  });
});
