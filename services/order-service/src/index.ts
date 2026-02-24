import express, { Request, Response } from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());

interface OrderPayload {
  product: string;
  quantity: number;
}

interface EventPayload {
  id: string;
  type: string;
  payload: OrderPayload;
  timestamp: string;
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "order-service",
    timestamp: new Date().toISOString(),
  });
});

app.post("/order", async (req: Request, res: Response) => {
  const order: OrderPayload = req.body;

  const event: EventPayload = {
    id: uuidv4(),
    type: "ORDER_CREATED",
    payload: order,
    timestamp: new Date().toISOString(),
  };

  try {
    await axios.post("http://localhost:3002/event", event);
    res.json({ message: "Order created and event emitted", event });
  } catch (error) {
    res.status(500).json({ error: "Failed to emit event" });
  }
});

app.listen(3001, () => {
  console.log("Order Service running on port 3001");
});