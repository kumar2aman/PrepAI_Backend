import { createWavHeader } from "./createWavHeader";
import * as fs from 'fs/promises'; 

export async function saveWaveFile(
  filename: string,
  pcmData: Buffer, // Ensure pcmData is a Buffer (which audioBuffer is)
  channels = 1,
  rate = 24000, // Gemini TTS default is 24000 Hz
  sampleWidth = 2 // 2 bytes for 16-bit audio
): Promise<void> {
  try {
      // Generate the WAV header using the actual PCM data length
      const wavHeader = createWavHeader(
          pcmData.length,
          rate,
          channels,
          sampleWidth * 8 // Convert sampleWidth (bytes) to bitDepth (bits)
      );

      // Concatenate the header and the raw PCM data into a single buffer
      const fullWavBuffer = Buffer.concat([wavHeader, pcmData]);

      // Write the entire buffer directly to the file
      await fs.writeFile(filename, fullWavBuffer);
      // console.log(`Successfully wrote full WAV file: ${filename}`);

  } catch (error) {
      console.error(`Error saving WAV file ${filename}:`, error);
      throw error; // Re-throw the error so TTS function can catch it
  }
}