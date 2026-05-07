'use server';

/**
 * @fileOverview Analyzes text input to determine emotional state and stress level.
 *
 * - analyzeTextEmotion - A function that handles the text emotion analysis process.
 * - TextEmotionAnalysisInput - The input type for the analyzeTextEmotion function.
 * - TextEmotionAnalysisOutput - The return type for the analyzeTextEmotion function.
 */

import {ai, assertGoogleAiConfigured} from '@/ai/genkit';
import {z} from 'genkit';

const TextEmotionAnalysisInputSchema = z.object({
  text: z.string().describe('The text to analyze for emotional state.'),
});
export type TextEmotionAnalysisInput = z.infer<typeof TextEmotionAnalysisInputSchema>;

const TextEmotionAnalysisOutputSchema = z.object({
  emotionalState: z.string().describe('The determined emotional state of the text (e.g., happy, sad, stressed).'),
  stressLevel: z.number().describe('The stress level detected in the text, on a scale of 0 to 100.'),
  summary: z.string().describe('A brief summary of the emotion analysis.'),
});
export type TextEmotionAnalysisOutput = z.infer<typeof TextEmotionAnalysisOutputSchema>;

export async function analyzeTextEmotion(input: TextEmotionAnalysisInput): Promise<TextEmotionAnalysisOutput> {
  assertGoogleAiConfigured();
  return analyzeTextEmotionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'textEmotionAnalysisPrompt',
  input: {schema: TextEmotionAnalysisInputSchema},
  output: {schema: TextEmotionAnalysisOutputSchema},
  prompt: `You are an AI text analysis expert specializing in detecting emotions and stress levels in text.

  Analyze the following text to determine the emotional state, stress level (0-100), and provide a brief summary of your analysis. Be concise and use data to determine the output.

  Text: {{{text}}}
  \nOutput your response in JSON format adhering to the schema's Zod descriptions.`, 
});

const analyzeTextEmotionFlow = ai.defineFlow(
  {
    name: 'analyzeTextEmotionFlow',
    inputSchema: TextEmotionAnalysisInputSchema,
    outputSchema: TextEmotionAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
