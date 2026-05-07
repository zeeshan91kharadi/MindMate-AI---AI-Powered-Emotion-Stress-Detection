import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const isGoogleAiConfigured =
  Boolean(process.env.GEMINI_API_KEY) || Boolean(process.env.GOOGLE_API_KEY);

export function assertGoogleAiConfigured() {
  if (!isGoogleAiConfigured) {
    throw new Error(
      'Google AI is not configured. Add GEMINI_API_KEY or GOOGLE_API_KEY to your environment variables.'
    );
  }
}

export const ai = genkit({
  plugins: isGoogleAiConfigured ? [googleAI()] : [],
  model: isGoogleAiConfigured ? 'googleai/gemini-2.5-flash' : undefined,
});
