import { createClient } from "redis";

const redisClient = createClient({
  password: 'pellisco123',
  socket: {
    host: '127.0.0.1',
    port: 6379,
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
  }
});

redisClient.on("error", (err) => console.log("❌ Redis Client Error:", err));

// Connect once
(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("✅ Redis Connected: Central Store Active");
    }
  } catch (err) {
    console.log("⚠️ Redis Connection Failed:", err.message);
  }
})();

export default redisClient;
