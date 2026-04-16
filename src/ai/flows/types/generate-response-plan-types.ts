import { z } from 'zod';
import { SecurityEventSchema as BaseSecurityEventSchema } from './simulate-attack-types';

export const GenerateResponsePlanInputSchema = BaseSecurityEventSchema;
export type GenerateResponsePlanInput = z.infer<typeof GenerateResponsePlanInputSchema>;

export const GenerateResponsePlanOutputSchema = z.object({
    suggestedSteps: z.array(z.string()).describe("A list of 3-4 concrete, actionable steps an analyst should take to respond to this specific event."),
    suggestedStatus: z.enum(['Contained', 'Resolved']).describe("The suggested status to move this event to after taking the initial steps."),
    justification: z.string().describe("A brief justification for the suggested steps and status.")
});
export type GenerateResponsePlanOutput = z.infer<typeof GenerateResponsePlanOutputSchema>;
