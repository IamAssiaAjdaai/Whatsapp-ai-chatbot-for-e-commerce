import fs from 'fs';
import OpenAI from 'openai';
import { env } from '../config/env';

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function transcribeAudio(filePath: string): Promise<{ text: string; durationSec?: number; confidence?: number }> {
  const file = fs.createReadStream(filePath);
  const result = await client.audio.transcriptions.create({
    file,
    model: 'gpt-4o-mini-transcribe'
  });

  return {
    text: result.text,
    durationSec: undefined,
    confidence: undefined
  };
}
