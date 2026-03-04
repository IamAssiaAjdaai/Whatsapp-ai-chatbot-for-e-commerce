# WhatsApp AI Chatbot for E-commerce (Africa-ready)

Production-oriented Node.js + TypeScript chatbot for WhatsApp commerce flows with multilingual support, voice-note transcription, deterministic state machine, and auditable order handling.

## Stack
- Express + TypeScript
- Meta WhatsApp Cloud API
- OpenAI API (intent + transcription)
- PostgreSQL + Prisma
- Redis + BullMQ
- Jest + supertest
- pino logs, zod validation, dotenv config

## Features
- `/webhook` verification (GET) + inbound processing (POST)
- Text, audio, interactive button support
- Voice-note queue: media download -> transcription -> conversation
- Language detection + same-language responses (Arabic/French/English baseline)
- Deterministic state machine per user
- E-commerce abstraction layer with mock catalog implementation
- Safety controls: prompt injection resistance, rate limiting, confirmation before destructive actions, no card data collection
- `/health` endpoint

## Project structure
```txt
src/
  app.ts
  server.ts
  routes/webhook.ts
  services/
    whatsapp.ts
    ai.ts
    transcription.ts
    conversation.ts
    stateMachine.ts
    ecommerce/
  queues/
  db/
  utils/
  prompts/
prisma/
```

## Environment variables
Copy `.env.example` to `.env` and fill:
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_VERIFY_TOKEN`
- `OPENAI_API_KEY`
- `DATABASE_URL`
- `REDIS_URL`
- `BASE_URL`
- `DEFAULT_CURRENCY` (default: `NGN`)
- `BUSINESS_TIMEZONE` (default: `Africa/Lagos`)
- `PORT`

## Meta WhatsApp Cloud API setup
1. Create Meta app, enable WhatsApp product.
2. Add a test number and permanent access token.
3. Set webhook URL: `https://<your-domain>/webhook` and verify token.
4. Subscribe to `messages` event.
5. Add your sender phone number ID to `.env`.

## Local run (Docker)
```bash
docker-compose up --build
```
Then run migrations in API container:
```bash
docker compose exec api npx prisma migrate deploy
```

## Local run (without Docker)
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Tests
```bash
npm test
```

## Example webhook verification
```bash
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=$WHATSAPP_VERIFY_TOKEN&hub.challenge=1234"
```

## Example inbound webhook POST
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"entry":[{"changes":[{"value":{"messages":[{"from":"2348000000000","type":"text","text":{"body":"I want sandals"}}]}}]}]}'
```

## System prompt and tool schema
See `src/prompts/systemPrompt.ts` for the hard safety prompt and strict function-calling schema used by OpenAI.

## 24h+ re-engagement template examples
Use approved WhatsApp templates:
1. `order_update_en`: "Your order {{1}} is now {{2}}. Reply HELP for support."
2. `order_update_fr`: "Votre commande {{1}} est maintenant {{2}}. Répondez AIDE pour assistance."
3. `order_update_ar`: "طلبك {{1}} أصبح حالته {{2}}. رد بكلمة مساعدة للدعم."

## Notes for production hardening
- Add durable media object storage (S3 or GCS)
- Add ffmpeg conversion step based on MIME detection
- Add Prometheus metrics exporter
- Add retries/backoff + dead-letter queue for failed transcription jobs
- Replace `MockEcommerceService` with Shopify/WooCommerce/custom API adapter via shared interface
