import { z } from 'zod';

export const GenerateAttackScriptInputSchema = z.object({
  description: z.string().describe('A natural language description of the cloud-native attack to simulate.'),
});
export type GenerateAttackScriptInput = z.infer<typeof GenerateAttackScriptInputSchema>;

export const GenerateAttackScriptOutputSchema = z.object({
    script: z.string().describe('The generated PowerShell or shell script for the described attack.'),
});
export type GenerateAttackScriptOutput = z.infer<typeof GenerateAttackScriptOutputSchema>;
