export function createWavHeader(dataLength: number, sampleRate: number = 24000, numChannels: number = 1, bitDepth: number = 16): Buffer {
    const header = Buffer.alloc(44);

    // RIFF header
    header.write('RIFF', 0);
    header.writeUInt32LE(dataLength + 36, 4); // File size - 8 bytes (RIFF + file size)
    header.write('WAVE', 8);

    // fmt chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
    header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
    header.writeUInt16LE(numChannels, 22); // NumChannels
    header.writeUInt32LE(sampleRate, 24); // SampleRate
    header.writeUInt32LE(sampleRate * numChannels * (bitDepth / 8), 28); // ByteRate
    header.writeUInt16LE(numChannels * (bitDepth / 8), 32); // BlockAlign
    header.writeUInt16LE(bitDepth, 34); // BitsPerSample

    // data chunk
    header.write('data', 36);
    header.writeUInt32LE(dataLength, 40); // Subchunk2Size (audio data size)

    return header;
}
