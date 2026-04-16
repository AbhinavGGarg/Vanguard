'use server';
/**
 * @fileOverview An AI flow to simulate and analyze the interaction between an attack script and a defense script.
 *
 * - analyzeInteraction - A function that handles the interaction analysis.
 */

import { ai } from '@/ai/genkit';
import { AnalyzeInteractionInputSchema, AnalyzeInteractionOutputSchema } from './types/analyze-interaction-types';

export { type AnalyzeInteractionInput, type AnalyzeInteractionOutput, type InteractionStep } from './types/analyze-interaction-types';


export async function analyzeInteraction(input: import('./types/analyze-interaction-types').AnalyzeInteractionInput): Promise<import('./types/analyze-interaction-types').AnalyzeInteractionOutput> {
  return analyzeInteractionFlow(input);
}

const analyzeInteractionFlow = ai.defineFlow(
  {
    name: 'analyzeInteractionFlow',
    inputSchema: AnalyzeInteractionInputSchema,
    outputSchema: AnalyzeInteractionOutputSchema,
  },
  async (input) => {
    const prompt = `You are a "Purple Team" cybersecurity expert, simulating and analyzing a cyber engagement in real-time. Your task is to analyze an attack script and a corresponding defense script. You will simulate the interaction step-by-step.

Attack Script:
\`\`\`
{{{attackScript}}}
\`\`\`

Defense Script:
\`\`\`
{{{defenseScript}}}
\`\`\`

First, provide a final analysis of the engagement:
1.  **effectivenessScore**: An integer score from 0 to 100 representing how well the defense script mitigates the attack.
2.  **attacksBlocked**: An integer count of how many specific attack actions were successfully blocked or mitigated. This number must be realistic and directly correspond to the number of successful "Defense" actions in the log.
3.  **outcomeSummary**: A concise summary explaining the final outcome, what was blocked, and what succeeded.
4.  **modifiedDefenseScript**: An improved version of the defense script that addresses any identified weaknesses.

Second, and most importantly, generate a step-by-step **interactionLog**. Simulate the attacker's actions and the defender's responses chronologically. Each step should be a distinct action.
- For each step in the \`interactionLog\`, the \`description\` must be a concise, single-sentence summary of the action taken, **referencing the specific command or line from the script where possible.**
- An **Attack** action is a command from the attack script being executed.
- A **Defense** action is a command from the defense script being executed or a pre-existing policy that blocks an attack.
- A **System** action can be used for context, like "Simulation starting".
- The log must clearly show cause and effect. The \`result\` should state the immediate outcome (e.g., 'Success', 'Blocked by Rule X', 'No Effect', 'Policy Applied').

Provide the entire output in the specified JSON format.
`;

    const promptConfig = {
      name: 'analyzeInteractionPrompt',
      input: { schema: AnalyzeInteractionInputSchema },
      output: { schema: AnalyzeInteractionOutputSchema },
      prompt: prompt,
      config: {
          safetySettings: [
              {
                  category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                  threshold: 'BLOCK_NONE',
              },
          ],
      },
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
