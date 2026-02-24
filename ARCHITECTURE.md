# Architecture Deep Dive

## Design Goals

- Decouple services
- Ensure reliable delivery
- Prevent duplicate processing
- Enable eventual consistency

## Event Processing Strategy

Each event contains:

- Unique ID
- Type
- Payload

Before processing, the system should:

1. Check if event ID already processed (idempotency).
2. Attempt webhook dispatch.
3. On failure, push event into retry queue.
4. Worker retries every 5 seconds.

## Failure Handling

Simulated external failures (30%) demonstrate:

- Need for retry
- Importance of dead-letter queue
- Observability necessity

## Improvements (Future Enhancements)

- Exponential backoff
- DLQ threshold handling
- Metrics endpoint
- Structured logging
- Distributed tracing
- Idempotency table in PostgreSQL