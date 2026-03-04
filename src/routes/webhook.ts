import { Router } from 'express';
import { env } from '../config/env';
import { prisma } from '../db/prisma';
import { audioQueue } from '../queues/audioQueue';
import { handleConversation } from '../services/conversation';
import { sendInteractiveButtons, sendTextMessage } from '../services/whatsapp';

const router = Router();
const userRate = new Map<string, { count: number; at: number }>();

router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send('Forbidden');
});

router.post('/webhook', async (req, res, next) => {
  try {
    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const phone = message.from as string;
    const now = Date.now();
    const existing = userRate.get(phone);
    if (existing && now - existing.at < 60_000 && existing.count > 30) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    userRate.set(phone, { count: (existing?.count || 0) + 1, at: now });

    const user = await prisma.user.upsert({ where: { phoneNumber: phone }, update: {}, create: { phoneNumber: phone } });
    const text = message.text?.body || message.button?.text || message.interactive?.button_reply?.title;

    await prisma.message.create({
      data: {
        userId: user.id,
        type: message.type === 'audio' ? 'AUDIO' : message.type === 'interactive' ? 'INTERACTIVE' : 'TEXT',
        rawPayload: message,
        normalizedText: text,
        direction: 'INBOUND'
      }
    });

    if (message.type === 'audio') {
      await audioQueue.add('transcribe', { mediaId: message.audio.id, phone, userId: user.id });
      await sendTextMessage(phone, 'Audio received. Processing now...');
      return res.sendStatus(200);
    }

    const result = await handleConversation(phone, text || '');

    await sendTextMessage(phone, result.reply);
    await sendInteractiveButtons(phone, 'Quick actions');

    await prisma.message.create({
      data: {
        userId: user.id,
        type: 'TEXT',
        language: result.language,
        rawPayload: { intent: result.intent, reply: result.reply },
        normalizedText: result.reply,
        direction: 'OUTBOUND'
      }
    });

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

export default router;
