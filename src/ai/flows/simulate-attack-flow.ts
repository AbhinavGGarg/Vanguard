
'use server';
/**
 * @fileOverview An AI flow to model a cyber attack based on a provided script and generate corresponding security events, metrics, and a detailed analysis.
 *
 * - modelAttackScenario - A function that handles the attack modeling process.
 */

import { ai } from '@/ai/genkit';
import { ModelAttackScenarioInputSchema, ModelAttackScenarioOutputSchema } from './types/simulate-attack-types';

export { type ModelAttackScenarioOutput, type SecurityEvent, type CloudResource } from './types/simulate-attack-types';

export async function modelAttackScenario(input: import('./types/simulate-attack-types').ModelAttackScenarioInput): Promise<import('./types/simulate-attack-types').ModelAttackScenarioOutput> {
  return modelAttackScenarioFlow(input);
}

const modelAttackScenarioFlow = ai.defineFlow(
  {
    name: 'modelAttackScenarioFlow',
    inputSchema: ModelAttackScenarioInputSchema,
    outputSchema: ModelAttackScenarioOutputSchema,
  },
  async (input) => {
    const prompt = `You are a Cloud Intrusion Detection System (CIDS) analyzer and a senior security automation engineer. Your role is to generate realistic security data and a professional threat analysis based on a cyber attack script provided by the user.

First, meticulously analyze the following script to understand its intent, methodology, and potential impact.

Script to analyze:
\`\`\`
{{{script}}}
\`\`\`

Based on your analysis of this script, generate a complete scenario analysis output. This includes:
1.  **Threat Analysis**: A detailed analysis including a risk score, executive summary, technical breakdown, and recommended actions. The analysis must be specific to the actions in the script.
2.  **Suggested Countermeasure**: Write a practical PowerShell or shell script that a security administrator could run to help mitigate the threat.
3.  **Affected Cloud Resources**: Generate a list of 5 to 10 specific and realistic cloud resources that would be directly impacted by the actions in the provided script. The connection between the script and the resource must be direct and logical. For each resource, the 'reasonForStatus' field is critical and must explicitly tie the status to a specific action in the attack script (e.g., "Status is 'Compromised' because the script successfully downloaded sensitive data from this S3 bucket.").
4.  **Security Events**: A list of 20 to 30 diverse security events that would be generated if this script were executed. **Crucially, all events must start in a state that requires user review, such as 'Investigating' or 'Action Required'. Do NOT generate events with a 'Resolved' or 'Contained' status.** Reference MITRE ATT&CK techniques where possible.
5.  **Dashboard Metrics**: Plausible metrics (total events, active threats, etc.) reflecting the script's impact. The 'blockedAttacks' metric must be 0, as this represents the initial, unmitigated attack.
6.  **Chart Data**: Top processes and events that would be observed as a result of the script's execution.

Provide the entire output in the specified JSON format.
`;
    
    const promptConfig = {
        name: 'modelAttackScenarioPrompt',
        input: { schema: ModelAttackScenarioInputSchema },
        output: { schema: ModelAttackScenarioOutputSchema },
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
            input
        });
        return output!;
    } catch (e: any) {
        if (e.message?.includes('429')) {
             const { output } = await ai.generate({
                ...promptConfig,
                model: 'googleai/gemini-pro',
                prompt: prompt,
                input
            });
            return output!;
        }
        throw e;
    }
  }
);
    
