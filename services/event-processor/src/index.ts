import express, { Request, Response } from "express";
import axios from "axios";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

interface EventPayload {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
}

app.post("/event", async (req: Request, res: Response) => {
  const event: EventPayload = req.body;

  const alreadyProcessed = await redis.sismember(
    "processed_events",
    event.id
  );

  if (alreadyProcessed) {
    return res.json({ status: "duplicate_ignored" });
  }

  try {
    await axios.post("http://localhost:3003/webhook", event);

    await redis.sadd("processed_events", event.id);

    res.json({ status: "delivered" });
  } catch (error) {
    await redis.lpush("retry_queue", JSON.stringify(event));
    res.json({ status: "queued_for_retry" });
  }
});

// Retry Worker (runs every 5 seconds)
setInterval(async () => {
  const event = await redis.rpop("retry_queue");

  if (event) {
    const parsed = JSON.parse(event);

    const alreadyProcessed = await redis.sismember(
      "processed_events",
      parsed.id
    );

    if (alreadyProcessed) {
      return;
    }

    try {
      await axios.post("http://localhost:3003/webhook", parsed);

      await redis.sadd("processed_events", parsed.id);

      console.log("Retried successfully");
    } catch {
      await redis.lpush("retry_queue", event);
    }
  }
}, 5000);

app.listen(3002, () => {
  console.log("Event Processor running on port 3002");
});