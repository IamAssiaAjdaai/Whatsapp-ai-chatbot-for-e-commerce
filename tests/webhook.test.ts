import request from 'supertest';

process.env.WHATSAPP_ACCESS_TOKEN = 'x';
process.env.WHATSAPP_PHONE_NUMBER_ID = 'x';
process.env.WHATSAPP_VERIFY_TOKEN = 'verify';
process.env.OPENAI_API_KEY = 'x';
process.env.DATABASE_URL = 'postgresql://x';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.BASE_URL = 'http://localhost:3000';

jest.mock('../src/services/whatsapp', () => ({
  sendTextMessage: jest.fn().mockResolvedValue(undefined),
  sendInteractiveButtons: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../src/services/conversation', () => ({
  handleConversation: jest.fn().mockResolvedValue({ reply: 'ok', language: 'en', intent: 'SMALLTALK' })
}));

jest.mock('../src/queues/audioQueue', () => ({
  audioQueue: { add: jest.fn().mockResolvedValue(undefined) }
}));

jest.mock('../src/db/prisma', () => ({
  prisma: {
    user: { upsert: jest.fn().mockResolvedValue({ id: 'u1', phoneNumber: '234' }) },
    message: { create: jest.fn().mockResolvedValue({}) }
  }
}));

import { app } from '../src/app';

describe('Webhook', () => {
  it('verifies webhook', async () => {
    const res = await request(app).get('/webhook?hub.mode=subscribe&hub.verify_token=verify&hub.challenge=123');
    expect(res.status).toBe(200);
    expect(res.text).toBe('123');
  });

  it('handles text message', async () => {
    const payload = {
      entry: [{ changes: [{ value: { messages: [{ from: '234', type: 'text', text: { body: 'hello' } }] } }] }]
    };
    const res = await request(app).post('/webhook').send(payload);
    expect(res.status).toBe(200);
  });

  it('handles audio message', async () => {
    const payload = {
      entry: [{ changes: [{ value: { messages: [{ from: '234', type: 'audio', audio: { id: 'm1' } }] } }] }]
    };
    const res = await request(app).post('/webhook').send(payload);
    expect(res.status).toBe(200);
  });
});
