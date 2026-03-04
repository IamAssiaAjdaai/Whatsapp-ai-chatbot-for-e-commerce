import OpenAI from 'openai';
import { env } from '../config/env';
import { SYSTEM_PROMPT, TOOL_SCHEMAS } from '../prompts/systemPrompt';

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function classifyIntent(input: string, language: string) {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Language: ${language}. Message: ${input}` }
    ],
    tools: TOOL_SCHEMAS.map((tool) => ({ type: 'function' as const, function: tool })),
    tool_choice: { type: 'function', function: { name: 'classify_intent' } }
  });

  const call = response.choices[0]?.message?.tool_calls?.[0];
  if (!call) return { intent: 'SMALLTALK', entities: {} };
  return JSON.parse(call.function.arguments);
}
