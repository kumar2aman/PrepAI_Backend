import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { PassThrough } from 'stream';

// Set the path to ffmpeg
//@ts-ignore
ffmpeg.setFfmpegPath(ffmpegStatic);

// Function to convert WebM Buffer to PCM Buffer
export const webmToPCM = (data: Buffer): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(data); // Feed your buffer into the stream

    const outputChunks:any[] = [];
    const outputStream = new PassThrough();

    outputStream.on('data', (chunk) => outputChunks.push(chunk));
    outputStream.on('end', () => resolve(Buffer.concat(outputChunks)));
    outputStream.on('error', (err) => reject(err));

    ffmpeg()
      .input(inputStream)
      .inputFormat('webm') // specify input format if needed
      .audioCodec('pcm_s16le') // Set output to PCM signed 16-bit little-endian
      .audioChannels(1)
      .audioFrequency(16000)
      .format('s16le')
      .on('error', (err) => reject(err))
      .pipe(outputStream, { end: true });
  });
};