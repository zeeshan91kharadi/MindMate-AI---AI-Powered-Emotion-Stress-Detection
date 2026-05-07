'use server';

/**
 * @fileOverview An AI agent that recommends relaxation techniques based on stress level.
 *
 * - getRelaxationRecommendation - A function that returns AI-recommended relaxation techniques.
 * - RelaxationRecommendationInput - The input type for the getRelaxationRecommendation function.
 * - RelaxationRecommendationOutput - The return type for the getRelaxationRecommendation function.
 */

import {ai, assertGoogleAiConfigured} from '@/ai/genkit';
import {z} from 'genkit';

const RelaxationRecommendationInputSchema = z.object({
  stressLevel: z
    .number()
    .min(0)
    .max(100)
    .describe('The user stress level, a number between 0 and 100.'),
});
export type RelaxationRecommendationInput = z.infer<typeof RelaxationRecommendationInputSchema>;

const RelaxationRecommendationOutputSchema = z.object({
  recommendation: z
    .string()
    .describe(
      'A recommendation for a relaxation technique, including breathing exercises, meditation, and yoga.  The response should be no more than 2 sentences.'
    ),
});
export type RelaxationRecommendationOutput = z.infer<typeof RelaxationRecommendationOutputSchema>;

export async function getRelaxationRecommendation(
  input: RelaxationRecommendationInput
): Promise<RelaxationRecommendationOutput> {
  assertGoogleAiConfigured();
  return relaxationRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'relaxationRecommendationPrompt',
  input: {schema: RelaxationRecommendationInputSchema},
  output: {schema: RelaxationRecommendationOutputSchema},
  prompt: `You are an AI wellness assistant that recommends relaxation techniques.

  Based on the user's stress level, provide a recommendation for a relaxation technique.

  Stress Level: {{{stressLevel}}}
  `,
});

const relaxationRecommendationFlow = ai.defineFlow(
  {
    name: 'relaxationRecommendationFlow',
    inputSchema: RelaxationRecommendationInputSchema,
    outputSchema: RelaxationRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
