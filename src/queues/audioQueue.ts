import { Queue, Worker } from 'bullmq';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import { transcribeAudio } from '../services/transcription';
import { downloadMedia, getMediaUrl } from '../services/whatsapp';
import { logger } from '../utils/logger';

const connection = { url: env.REDIS_URL };
export const audioQueue = new Queue('audio-processing', { connection });

export const audioWorker = new Worker(
  'audio-processing',
  async (job) => {
    const { mediaId } = job.data as { mediaId: string };
    const mediaUrl = await getMediaUrl(mediaId);
    const audio = await downloadMedia(mediaUrl);
    const tmpDir = path.join(process.cwd(), 'tmp');
    await fs.mkdir(tmpDir, { recursive: true });
    const inPath = path.join(tmpDir, `${mediaId}.ogg`);
    await fs.writeFile(inPath, audio);

    // For production, run ffmpeg conversion here if required.
    const transcript = await transcribeAudio(inPath);
    return transcript;
  },
  { connection }
);

audioWorker.on('failed', (_, err) => logger.error({ err }, 'audio job failed'));
