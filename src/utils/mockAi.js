/**
 * Generates a mock AI response based on the user's input.
 * To make it feel premium, it analyzes keywords and returns structured text (markdown, lists, etc.)
 */
export const getMockResponse = (userInput) => {
  const query = userInput.toLowerCase().trim();

  // 1. GREETINGS
  if (
    query === 'hello' ||
    query === 'hi' ||
    query === 'hey' ||
    query.startsWith('hello ') ||
    query.startsWith('hi ')
  ) {
    return `Hello! 👋 I'm your premium simulated AI assistant. 

How can I help you today? You can ask me to:
- Write some code (try typing "code")
- Explain a concept (try typing "explain React")
- Format lists or data
- Simulate streaming speed and cursor behaviors`;
  }

  // 2. CODE REQUEST
  if (
    query.includes('code') ||
    query.includes('javascript') ||
    query.includes('css') ||
    query.includes('html') ||
    query.includes('program') ||
    query.includes('write a function')
  ) {
    return `Here is a custom React hook that manages localStorage state with sync support. You can use it in your next production-ready project:

\`\`\`javascript
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage key:", key, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error setting localStorage key:", key, error);
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
\`\`\`

You can copy and paste this into any React component to instantly persist states! Let me know if you want to modify this hook.`;
  }

  // 3. EXPLAIN CONCEPT
  if (query.includes('react') || query.includes('explain') || query.includes('what is')) {
    return `React is a free and open-source front-end JavaScript library for building user interfaces based on components. It is maintained by Meta and a community of individual developers and companies.

### Key Concepts:
1. **Component-Based:** Build encapsulated components that manage their own state, then compose them to make complex UIs.
2. **Virtual DOM:** React keeps a lightweight representation of the real DOM in memory, enabling super-fast UI updates.
3. **Declarative:** React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes.

Would you like me to write a sample component to demonstrate React state?`;
  }

  // 4. CLEAR HISTORY
  if (query.includes('clear') || query.includes('reset')) {
    return `I can help you reset the conversation! 

To clear this workspace:
1. Click the **"Clear Conversation"** button in the header.
2. Or type a command if implemented.

This will clear all messages from your browser's \`localStorage\`.`;
  }

  // 5. DEFAULT PREMIUM RESPONSE
  return `Your request is processed. 

Here is a detailed breakdown of the simulated response engine:
- **Streaming Speed:** ~25ms per character.
- **Visuals:** A pulsing neon-colored blinking cursor is active at the typing terminal.
- **Persistence:** This response is automatically saved to \`localStorage\` once streaming completes.

Feel free to ask me questions like:
- *"Write some javascript code"*
- *"What is React?"*
- *"Say hello"*`;
};
