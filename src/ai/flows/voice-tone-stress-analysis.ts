// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Analyzes voice tone to detect stress levels.
 *
 * - analyzeVoiceTone - A function that handles the voice tone analysis process.
 * - AnalyzeVoiceToneInput - The input type for the analyzeVoiceTone function.
 * - AnalyzeVoiceToneOutput - The return type for the analyzeVoiceTone function.
 */

import {ai, assertGoogleAiConfigured} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeVoiceToneInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data URI of the user's voice recording, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeVoiceToneInput = z.infer<typeof AnalyzeVoiceToneInputSchema>;

const AnalyzeVoiceToneOutputSchema = z.object({
  stressLevel: z
    .number()
    .describe('The detected stress level, ranging from 0 to 100.'),
  analysis: z.string().describe('A detailed analysis of the voice tone.'),
});
export type AnalyzeVoiceToneOutput = z.infer<typeof AnalyzeVoiceToneOutputSchema>;

export async function analyzeVoiceTone(input: AnalyzeVoiceToneInput): Promise<AnalyzeVoiceToneOutput> {
  assertGoogleAiConfigured();
  return analyzeVoiceToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeVoiceTonePrompt',
  input: {schema: AnalyzeVoiceToneInputSchema},
  output: {schema: AnalyzeVoiceToneOutputSchema},
  prompt: `You are an AI voice analyst specializing in detecting stress levels from voice recordings.

You will analyze the provided voice recording and determine the stress level, ranging from 0 to 100. A higher number indicates a higher level of stress. Provide a detailed analysis of the voice tone, including any indicators of stress, such as pitch, rate, and intensity. Return result in JSON format.

Voice Recording: {{media url=audioDataUri}}`,
});

const analyzeVoiceToneFlow = ai.defineFlow(
  {
    name: 'analyzeVoiceToneFlow',
    inputSchema: AnalyzeVoiceToneInputSchema,
    outputSchema: AnalyzeVoiceToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
