'use server';
/**
 * @fileOverview An AI flow to analyze a script for malicious content.
 *
 * - analyzeScript - A function that handles the script analysis process.
 */

import { ai } from '@/ai/genkit';
import { AnalyzeScriptInputSchema, AnalyzeScriptOutputSchema } from './types/analyze-script-types';

export { type AnalyzeScriptInput, type AnalyzeScriptOutput } from './types/analyze-script-types';


export async function analyzeScript(input: import('./types/analyze-script-types').AnalyzeScriptInput): Promise<import('./types/analyze-script-types').AnalyzeScriptOutput> {
  return analyzeScriptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'analyzeScriptPrompt',
    input: { schema: AnalyzeScriptInputSchema },
    output: { schema: AnalyzeScriptOutputSchema },
    prompt: `You are a senior cybersecurity analyst specializing in malware and script analysis. Your task is to analyze the provided script and determine if it is malicious.

Analyze the following script:
\`\`\`
{{{script}}}
\`\`\`

Based on your analysis, provide the following:
1.  **isMalicious**: A boolean value indicating if the script is malicious.
2.  **riskScore**: An integer risk score from 0 (safe) to 100 (critically dangerous). Base this score on the potential impact and intent of the script.
3.  **summary**: A brief, technical summary of the script's functionality. Explain what it attempts to do.
4.  **recommendations**: A clear, actionable recommendation for a security administrator. Examples: "Safe to run," "Monitor with caution," "Block immediately and investigate."

Provide the output in the specified JSON format.
`,
    config: {
        safetySettings: [
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
            },
        ],
    },
});

const analyzeScriptFlow = ai.defineFlow(
  {
    name: 'analyzeScriptFlow',
    inputSchema: AnalyzeScriptInputSchema,
    outputSchema: AnalyzeScriptOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
