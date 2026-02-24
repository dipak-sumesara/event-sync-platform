# Architecture Diagram

```
           +----------------+
           |  Order Service |
           +--------+-------+
                    |
                    |  emits event
                    v
           +-------------------+
           |  Event Processor  |
           +---------+---------+
                     |
       +-------------+--------------+
       |                            |
       v                            v
+-------------+              +-------------+
| Redis Queue |              | External    |
| Retry Store |              | System Mock |
+-------------+              +-------------+
```

---

## Components

### Order Service
Responsible for emitting domain events.

### Event Processor
Handles:

- Idempotency validation
- Webhook delivery
- Retry scheduling
- Dead-letter logic

### Redis
Used for:

- Retry queue
- Processed event tracking

### External System
Simulates real-world unreliable dependency.

---

## Retry Strategy

If delivery fails:

Retry delay = 2^retryCount seconds

Max retries = 5

After threshold → event considered dead-lettered.