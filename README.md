# Event Sync Platform

A distributed webhook-based event synchronization platform built with TypeScript, Express, Redis, and event-driven retry patterns.

This project demonstrates how to design reliable cross-system integrations in a microservice environment.

---

## 🎯 Problem Statement

In distributed systems, integrating with external platforms (e.g., Salesforce, ERP, payment gateways) introduces challenges:

- Network failures
- Partial system downtime
- Duplicate events
- Schema mismatches
- Eventual consistency concerns

This platform simulates those challenges and implements production-grade handling strategies.

---

## 🏗 Architecture Overview

Services:

- **Order Service** → Emits domain events
- **Event Processor** → Handles delivery, retries, idempotency
- **External System (Mock)** → Simulates unreliable external dependency
- **Redis** → Retry queue + idempotency store

### Event Flow

1. Order is created.
2. Event is emitted to Event Processor.
3. Event Processor attempts webhook delivery.
4. On failure → event is queued.
5. Retry worker applies exponential backoff.
6. After max retries → dead-letter behavior.

---

## 🔐 Reliability Features

- Idempotent event processing
- Redis-based duplicate detection
- Exponential backoff retry (2^n seconds)
- Dead-letter threshold
- Health check endpoints
- Environment-based configuration
- Structured logging

---

## ⚙️ How to Run

Start Redis:

```bash
docker run -p 6379:6379 redis
```

Run services individually:

```bash
cd services/external-system && npm run dev
cd services/event-processor && npm run dev
cd services/order-service && npm run dev
```

Trigger event:

```
POST http://localhost:3001/order
```

---

## 🧠 Design Decisions

### Why Redis for retry queue?
Fast, simple, atomic operations, good for lightweight queue simulation.

### Why idempotency?
Distributed systems can deliver the same event multiple times.
We prevent duplicate side-effects.

### Why exponential backoff?
Avoids overwhelming external systems during outage.

### Why dead-letter threshold?
Prevents infinite retry loops and resource exhaustion.

---

## 🚀 Future Improvements

- Persist idempotency keys in PostgreSQL
- Introduce message broker (Kafka/RabbitMQ)
- Add metrics endpoint (Prometheus)
- Add structured logging (Pino)
- Containerize entire system with Docker Compose

---

## 📌 What This Demonstrates

This project reflects real-world patterns used in:

- Enterprise integrations
- Internal admin platforms
- B2B SaaS infrastructure
- Webhook-driven architectures

It focuses on reliability, not just API wiring.