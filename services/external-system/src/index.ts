import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "external-system",
    timestamp: new Date().toISOString(),
  });
});

app.post("/webhook", (req: Request, res: Response) => {
  // Simulate 30% failure
  if (Math.random() < 0.3) {
    console.log("Simulated failure");
    return res.status(500).json({ error: "Random failure" });
  }

  console.log("Webhook received:", req.body);
  res.json({ message: "Webhook processed successfully" });
});

app.listen(3003, () => {
  console.log("External System running on port 3003");
});