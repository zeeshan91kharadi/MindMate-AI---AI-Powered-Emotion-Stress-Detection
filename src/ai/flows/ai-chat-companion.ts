
'use server';

/**
 * @fileOverview Provides an AI chat companion for real-time support and relaxation tips.
 *
 * - aiChatCompanion - A function that provides an AI chat companion experience.
 * - AIChatCompanionInput - The input type for the aiChatCompanion function.
 * - AIChatCompanionOutput - The return type for the aiChatCompanion function.
 */

import {ai, assertGoogleAiConfigured} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatCompanionInputSchema = z.object({
  message: z.string().describe('The user message to the AI chat companion.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The chat history between the user and the AI.'),
});
export type AIChatCompanionInput = z.infer<typeof AIChatCompanionInputSchema>;

const AIChatCompanionOutputSchema = z.object({
  response: z.string().describe('The AI chat companion response, as plain text without any HTML or Markdown formatting.'),
});
export type AIChatCompanionOutput = z.infer<typeof AIChatCompanionOutputSchema>;

export async function aiChatCompanion(input: AIChatCompanionInput): Promise<AIChatCompanionOutput> {
  assertGoogleAiConfigured();
  return aiChatCompanionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatCompanionPrompt',
  input: {schema: AIChatCompanionInputSchema},
  output: {schema: AIChatCompanionOutputSchema},
  prompt: `You are a supportive and helpful AI Primary Psychologist designed to offer real-time support, relaxation tips, and personalized guidance to users feeling stressed.

  Your goal is to help the user manage their stress and feel more calm and relaxed. Provide actionable advice and encouragement.
  
  IMPORTANT: Your entire response must be plain text. Do not use any HTML, Markdown, or other formatting.

  Here's the user's message: {{{message}}}

  {% if chatHistory %}
  Here's the chat history:
  {{#each chatHistory}}
  {{role}}: {{content}}
  {{/each}}
  {% endif %}
  Response:`,  
});

const aiChatCompanionFlow = ai.defineFlow(
  {
    name: 'aiChatCompanionFlow',
    inputSchema: AIChatCompanionInputSchema,
    outputSchema: AIChatCompanionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
