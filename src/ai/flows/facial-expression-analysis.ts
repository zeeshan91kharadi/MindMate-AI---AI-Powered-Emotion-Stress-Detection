'use server';

/**
 * @fileOverview Analyzes facial expressions from images to detect emotional state and stress levels.
 *
 * - analyzeFacialExpression - A function that handles the facial expression analysis process.
 * - FacialExpressionAnalysisInput - The input type for the analyzeFacialExpression function.
 * - FacialExpressionAnalysisOutput - The return type for the analyzeFacialExpression function.
 */

import {ai, assertGoogleAiConfigured} from '@/ai/genkit';
import {z} from 'genkit';

const FacialExpressionAnalysisInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a person's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type FacialExpressionAnalysisInput = z.infer<typeof FacialExpressionAnalysisInputSchema>;

const FacialExpressionAnalysisOutputSchema = z.object({
  stressLevel: z
    .number()
    .describe('The detected stress level, ranging from 0 to 100.'),
  emotionalState: z
    .string()
    .describe('The detected primary emotion (e.g., happy, sad, stressed, neutral).'),
  analysis: z.string().describe('A brief analysis of the facial expression.'),
  error: z.enum(['quota_exceeded']).optional(),
  retryAfterSeconds: z.number().optional(),
});
export type FacialExpressionAnalysisOutput = z.infer<typeof FacialExpressionAnalysisOutputSchema>;

export async function analyzeFacialExpression(input: FacialExpressionAnalysisInput): Promise<FacialExpressionAnalysisOutput> {
  assertGoogleAiConfigured();
  try {
    return await analyzeFacialExpressionFlow(input);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('[429 Too Many Requests]') || message.includes('quota')) {
      const retryAfterMatch = message.match(/retry in ([\d.]+)s/i);
      return {
        stressLevel: 0,
        emotionalState: 'Quota exceeded',
        analysis:
          'Gemini free-tier quota has been reached. Wait a minute and try again, or enable billing/increase quota in Google AI Studio.',
        error: 'quota_exceeded',
        retryAfterSeconds: retryAfterMatch ? Math.ceil(Number(retryAfterMatch[1])) : undefined,
      };
    }
    throw error;
  }
}

const prompt = ai.definePrompt({
  name: 'facialExpressionAnalysisPrompt',
  input: {schema: FacialExpressionAnalysisInputSchema},
  output: {schema: FacialExpressionAnalysisOutputSchema},
  prompt: `You are an expert AI in analyzing human facial expressions to determine emotional state and stress levels.

Analyze the provided image of a person's face. Determine their stress level (0-100), their primary emotional state, and provide a brief analysis. Focus on indicators like brow furrowing, lip tension, eye shape, and other micro-expressions.

Image: {{media url=imageDataUri}}`,
});

const analyzeFacialExpressionFlow = ai.defineFlow(
  {
    name: 'analyzeFacialExpressionFlow',
    inputSchema: FacialExpressionAnalysisInputSchema,
    outputSchema: FacialExpressionAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
