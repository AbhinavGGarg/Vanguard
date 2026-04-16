import { z } from 'zod';

export const AnalyzeInteractionInputSchema = z.object({
  attackScript: z.string().describe('The original attack script.'),
  defenseScript: z.string().describe('The countermeasure script designed to mitigate the attack.'),
});
export type AnalyzeInteractionInput = z.infer<typeof AnalyzeInteractionInputSchema>;

export const InteractionStepSchema = z.object({
    step: z.number().describe("The sequence number of the step."),
    action: z.enum(['Attack', 'Defense', 'System']).describe("The entity performing the action."),
    description: z.string().describe("A concise, single-sentence description of the action taken, referencing the specific command or line if possible."),
    result: z.string().describe("The immediate outcome of the action, e.g., 'Success', 'Blocked by Rule X', 'No Effect', 'Policy Applied'."),
});
export type InteractionStep = z.infer<typeof InteractionStepSchema>;

export const AnalyzeInteractionOutputSchema = z.object({
    effectivenessScore: z.number().min(0).max(100).describe('A score from 0 (ineffective) to 100 (fully effective) on how well the defense mitigates the attack.'),
    attacksBlocked: z.number().describe('The integer count of attack actions that were successfully blocked or mitigated by the defense script.'),
    outcomeSummary: z.string().describe('A summary of what the defense script successfully prevented and where it fell short.'),
    modifiedDefenseScript: z.string().describe('An improved version of the defense script that addresses identified weaknesses.'),
    interactionLog: z.array(InteractionStepSchema).describe("A step-by-step log simulating the interaction between the scripts. It should have between 5 and 10 steps."),
});
export type AnalyzeInteractionOutput = z.infer<typeof AnalyzeInteractionOutputSchema>;
