import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['req.headers.authorization', 'WHATSAPP_ACCESS_TOKEN', 'OPENAI_API_KEY']
});

export const maskPhone = (phone: string): string => {
  if (phone.length < 4) return '***';
  return `${'*'.repeat(Math.max(phone.length - 4, 0))}${phone.slice(-4)}`;
};
