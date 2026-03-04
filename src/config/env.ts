import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  WHATSAPP_ACCESS_TOKEN: z.string().min(1),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().url(),
  BASE_URL: z.string().url(),
  DEFAULT_CURRENCY: z.string().default('NGN'),
  BUSINESS_TIMEZONE: z.string().default('Africa/Lagos'),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.string().default('development')
});

export const env = envSchema.parse(process.env);
