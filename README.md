# Event Sync Platform

A distributed webhook-based event synchronization platform built with Node.js (NestJS), PostgreSQL, and Redis.

This project demonstrates how to design reliable cross-system integrations using:

- Event-driven architecture
- Idempotent event handling
- Retry mechanisms with backoff
- Dead-letter queue strategy
- Service isolation
- Eventual consistency patterns

---

## 🏗 Architecture Overview

Services:

- **Order Service** – Emits domain events (ORDER_CREATED)
- **Event Processor** – Handles webhook dispatch, retries, and queue management
- **External System (Mock Salesforce)** – Simulates external integration with random failures
- **Redis** – Retry queue
- **PostgreSQL** – Persistent storage

Event Flow:

1. Order is created.
2. Event is emitted.
3. Event Processor dispatches webhook.
4. If failure occurs → event goes to retry queue.
5. Background worker retries until success.

---

## 🚀 How to Run

```bash
docker-compose up --build
```

Test:

POST http://localhost:3001/order

```
{
  "product": "Tshirt",
  "quantity": 100
}
```

---

## 🔒 Reliability Strategies

- Idempotent event handling
- Retry queue using Redis
- Randomized failure simulation
- Event reprocessing worker
- Separation of concerns between services

---

## 📌 Why This Matters

In real-world distributed systems, cross-system synchronization must tolerate:

- Partial failures
- Network timeouts
- Schema mismatches
- Duplicate events

This project demonstrates production-ready design patterns to handle those challenges.