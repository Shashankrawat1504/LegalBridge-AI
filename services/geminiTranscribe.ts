/**
 * Gemini Audio Transcription Service
 *
 * Transcribes audio using Google Gemini API with inline audio data.
 * Supports English and Hindi transcription.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function transcribeAudio(options: {
  base64Audio: string;
  mimeType?: string;
}): Promise<{ success: boolean; transcript?: string; error?: string }> {
  const { base64Audio, mimeType = 'audio/webm' } = options;

  const apiKey =
    process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'Gemini API key is missing. Please check EXPO_PUBLIC_GEMINI_API_KEY in .env',
    };
  }

  const ai = new GoogleGenerativeAI(apiKey);

  // Active production model list based on 2026 API requirements
  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.0-flash'
  ];

  let lastErrorMsg = '';

  for (const modelName of candidateModels) {
    try {
      console.log(`[GeminiTranscribe] Attempting transcription using model: ${modelName}`);

      const model = ai.getGenerativeModel({ model: modelName });
      
      const prompt = `You are a professional audio transcription AI. Transcribe the human speech in this audio verbatim.
      CRITICAL INSTRUCTIONS:
      1. Output ONLY the spoken words.
      2. NEVER output placeholder tags, sound descriptions, or non-speech indicators (e.g., do not output <noise>, [silence], [breathing], or [music]).
      3. If there is no clear human speech detected in the audio, you must output absolutely nothing. Return a completely empty string.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType || 'audio/webm',
            data: base64Audio,
          },
        },
      ]);

      const text = result.response.text();
      
      // If text exists (even if it's an empty string from our strict prompt), it's a success
      if (text !== undefined && text !== null) {
        const cleanText = text.trim();
        console.log(`[GeminiTranscribe] Success with ${modelName}! Transcript length: ${cleanText.length}`);
        return { success: true, transcript: cleanText };
      }
    } catch (err: any) {
      console.warn(`[GeminiTranscribe] Model ${modelName} failed: ${err?.message || err}`);
      lastErrorMsg = err?.message || String(err);
    }
  }

  return {
    success: false,
    error: `Transcription failed with all candidate models. Last error: ${lastErrorMsg}`,
  };
}

/**
 * Converts a Blob to base64 string
 *
 * @param blob Blob to convert
 * @returns Promise with base64 string
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Checks if microphone is available
 *
 * @returns Promise with availability status
 */
export async function checkMicrophoneAvailability(): Promise<{
  available: boolean;
  error?: string;
}> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    return {
      available: false,
      error: 'Microphone access not available in this browser.',
    };
  }

  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return { available: true };
  } catch (error: any) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return {
        available: false,
        error: 'Microphone permission denied. Please allow microphone access in browser settings.',
      };
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return {
        available: false,
        error: 'No microphone found. Please connect a microphone.',
      };
    }
    return {
      available: false,
      error: `Microphone error: ${error.message}`,
    };
  }
}