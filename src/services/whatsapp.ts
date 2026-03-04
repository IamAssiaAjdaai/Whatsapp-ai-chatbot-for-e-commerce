import axios from 'axios';
import { env } from '../config/env';

const graphBase = 'https://graph.facebook.com/v20.0';

export async function sendTextMessage(to: string, body: string) {
  await axios.post(
    `${graphBase}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body }
    },
    { headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}` } }
  );
}

export async function sendInteractiveButtons(to: string, body: string) {
  await axios.post(
    `${graphBase}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: body },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'add_to_cart', title: 'Add to cart' } },
            { type: 'reply', reply: { id: 'checkout', title: 'Checkout' } },
            { type: 'reply', reply: { id: 'agent', title: 'Talk to agent' } }
          ]
        }
      }
    },
    { headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}` } }
  );
}

export async function getMediaUrl(mediaId: string): Promise<string> {
  const response = await axios.get(`${graphBase}/${mediaId}`, {
    headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}` }
  });
  return response.data.url;
}

export async function downloadMedia(url: string): Promise<Buffer> {
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}` },
    responseType: 'arraybuffer'
  });
  return Buffer.from(response.data);
}
