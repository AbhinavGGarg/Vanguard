'use server';
/**
 * @fileOverview An AI flow to generate an incident response plan for a security event.
 *
 * - generateResponsePlan - A function that handles generating the response plan.
 */

import { ai } from '@/ai/genkit';
import { GenerateResponsePlanInputSchema, GenerateResponsePlanOutputSchema } from './types/generate-response-plan-types';

export async function generateResponsePlan(input: import('./types/generate-response-plan-types').GenerateResponsePlanInput): Promise<import('./types/generate-response-plan-types').GenerateResponsePlanOutput> {
  return generateResponsePlanFlow(input);
}

const generateResponsePlanFlow = ai.defineFlow(
  {
    name: 'generateResponsePlanFlow',
    inputSchema: GenerateResponsePlanInputSchema,
    outputSchema: GenerateResponsePlanOutputSchema,
  },
  async (input) => {
    const prompt = `You are a Tier 2 Security Operations Center (SOC) Analyst playbook generator. Your task is to create a concise incident response plan for a given security event.

Security Event Details:
- Event ID: {{{id}}}
- Timestamp: {{{timestamp}}}
- Severity: {{{severity}}}
- Description: {{{description}}}
- Current Status: {{{status}}}

Based on this event, provide a response plan in JSON format with the following fields:
1.  **suggestedSteps**: A list of 3-4 clear, actionable steps a security engineer should take immediately. Be specific. For example, instead of "Check logs", say "Correlate firewall logs with web server access logs for the 5 minutes surrounding the event timestamp."
2.  **suggestedStatus**: The most appropriate status to assign this event after the initial steps are taken, either 'Contained' or 'Resolved'.
3.  **justification**: A single sentence explaining why these steps are recommended.
`;

    const promptConfig = {
        name: 'generateResponsePlanPrompt',
        input: { schema: GenerateResponsePlanInputSchema },
        output: { schema: GenerateResponsePlanOutputSchema },
        prompt: prompt,
    };
    
    try {
        const { output } = await ai.generate({
            ...promptConfig,
            model: 'googleai/gemini-1.5-flash',
            prompt: prompt,
            input,
        });
        return output!;
    } catch (e: any) {
        if (e.message?.includes('429')) {
             const { output } = await ai.generate({
                ...promptConfig,
                model: 'googleai/gemini-pro',
                prompt: prompt,
                input,
            });
            return output!;
        }
        throw e;
    }
  }
);
