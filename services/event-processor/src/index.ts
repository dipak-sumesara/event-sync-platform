import express, { Request, Response } from "express";
import axios from "axios";
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

interface EventPayload {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
}

app.get("/health", async (_req: Request, res: Response) => {
  try {
    await redis.ping();

    res.json({
      status: "ok",
      service: "event-processor",
      redis: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({
      status: "error",
      redis: "disconnected",
    });
  }
});

app.post("/event", async (req: Request, res: Response) => {
  const event: EventPayload = req.body;

  console.log(`[EVENT RECEIVED] id=${event.id} type=${event.type}`);

  const alreadyProcessed = await redis.sismember(
    "processed_events",
    event.id
  );

  if (alreadyProcessed) {
    console.log(`[DUPLICATE IGNORED] id=${event.id}`);
    return res.json({ status: "duplicate_ignored" });
  }

  try {
    await axios.post(`${process.env.EXTERNAL_SYSTEM_URL}/webhook`, event);

    await redis.sadd("processed_events", event.id);

    console.log(`[DELIVERED] id=${event.id}`);

    res.json({ status: "delivered" });
  } catch (error) {
    console.log(`[FAILED → QUEUED] id=${event.id}`);

    await redis.lpush(
      "retry_queue",
      JSON.stringify({
        event,
        retryCount: 0,
        nextAttemptAt: Date.now()
      })
    );
    res.json({ status: "queued_for_retry" });
  }
});

// Retry Worker (runs every 5 seconds)
const MAX_RETRIES = 5;

setInterval(async () => {
  const raw = await redis.rpop("retry_queue");

  if (!raw) return;

  const item = JSON.parse(raw);

  const { event, retryCount, nextAttemptAt } = item;

  if (Date.now() < nextAttemptAt) {
    // Not ready yet — push back
    await redis.lpush("retry_queue", raw);
    return;
  }

  const alreadyProcessed = await redis.sismember(
    "processed_events",
    event.id
  );

  if (alreadyProcessed) {
    console.log(`[RETRY SKIPPED DUPLICATE] id=${event.id}`);
    return;
  }

  try {
    console.log(`[RETRYING] id=${event.id} attempt=${retryCount}`);

    await axios.post(`${process.env.EXTERNAL_SYSTEM_URL}/webhook`, event);

    await redis.sadd("processed_events", event.id);

    console.log(`[RETRY SUCCESS] id=${event.id}`);
  } catch {
    const newRetryCount = retryCount + 1;

    if (newRetryCount >= MAX_RETRIES) {
      console.log(`[DEAD LETTER] id=${event.id}`);
      return;
    }

    const delaySeconds = Math.pow(2, newRetryCount);

    const nextAttempt = Date.now() + delaySeconds * 1000;

    await redis.lpush(
      "retry_queue",
      JSON.stringify({
        event,
        retryCount: newRetryCount,
        nextAttemptAt: nextAttempt
      })
    );

    console.log(
      `[RETRY SCHEDULED] id=${event.id} nextAttemptIn=${delaySeconds}s`
    );
  }
}, 2000);

const PORT = Number(process.env.PORT) || 3002;

app.listen(PORT, () => {
  console.log("Event Processor running on port 3002");
});