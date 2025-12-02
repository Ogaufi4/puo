import { tool } from 'ai';
import { z } from 'zod';

interface RequestSuggestionsProps {
  session: any;
  dataStream: any;
}

export const requestSuggestions = ({ session, dataStream }: RequestSuggestionsProps) => tool({
  description: 'Request suggestions for a document',
  parameters: z.object({
    documentId: z.string().describe('The ID of the document to request suggestions for'),
  }),
  execute: async ({ documentId }) => {
    // Mock implementation
    return {
      suggestions: [
        { id: '1', text: 'Consider adding more details about the topic.' },
        { id: '2', text: 'Check for grammar errors in the second paragraph.' },
      ],
      documentId,
    };
  },
});
