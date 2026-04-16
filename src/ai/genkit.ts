import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // The Gemini 1.5 Flash model is a good general-purpose model for text generation.
      // The `temperature` parameter controls the randomness of the output.
      // A temperature of 0.2 is good for keeping the output factual.
      generationConfig: {temperature: 0.2},
    }),
  ],
  // The model to use for generation.
  model: 'googleai/gemini-1.5-flash',
  // Log all AI activity to the console.
  logLevel: 'debug',
  // Use a file-based storage for development.
  // In a production environment, you would use a different storage solution.
  flowStateStore: 'file',
  traceStore: 'file',
});
