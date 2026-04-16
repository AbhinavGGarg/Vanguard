import { z } from 'zod';

export const AnalyzeScriptInputSchema = z.object({
  script: z.string().describe('The script content to analyze (e.g., PowerShell, bash).'),
});
export type AnalyzeScriptInput = z.infer<typeof AnalyzeScriptInputSchema>;

export const AnalyzeScriptOutputSchema = z.object({
    isMalicious: z.boolean().describe('Whether or not the script is deemed malicious.'),
    riskScore: z.number().min(0).max(100).describe('A risk score from 0 (safe) to 100 (critical).'),
    summary: z.string().describe('A concise summary of what the script does.'),
    recommendations: z.string().describe('Recommended actions for the user (e.g., "Block and quarantine", "Monitor execution").'),
});
export type AnalyzeScriptOutput = z.infer<typeof AnalyzeScriptOutputSchema>;
