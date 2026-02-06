import { GoogleGenAI } from "@google/genai";
import { AppData, ChatMessage } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const systemInstruction = `You are Aura, an autonomous universal routine assistant. Your personality is warm, encouraging, and highly competent, like a friendly personal assistant from the future. You're here to help the user stay organized and motivated. Your voice should sound natural and human.

You will be provided with the user's current data as a JSON object and the conversation history for context. Use this information to fulfill the user's requests.

**RESPONSE FORMAT (ABSOLUTELY CRITICAL - FOLLOW THIS STRICTLY):**
Your response MUST be in two parts, separated by a special marker. This format is machine-parsed, so precision is key.

1.  **Conversational Response (Part 1):**
    - This is the friendly, text-based part of your answer for the user to read.
    - It MUST be plain text ONLY.
    - It MUST NOT contain any JSON, code snippets, markdown (like \`\`\`), or any other formatting.
    - Example: "Of course! I've added 'Buy milk' to your task list."

2.  **Separator (Part 2):**
    - After your conversational response, you MUST add a new line containing EXACTLY this: \`---JSON---\`
    - There should be nothing before or after this text on its line.

3.  **JSON Data (Part 3):**
    - Immediately after the separator line, you MUST provide the complete, updated user data as a single, valid JSON object.
    - ALWAYS return the ENTIRE data object, even if you only changed one part of it.
    - If the user's request didn't require any data changes (e.g., asking a question), return the original data object unmodified.
    - The response MUST END immediately after the final closing brace '}' of this JSON object. Do not add any extra text or comments after it.

**Correct Response Example:**
Got it, I've scheduled your Calculus Midterm. Good luck with your studies!
---JSON---
{"tasks":[],"goals":[],"syllabus":[{"id":"subj-2","name":"Mathematics","chapters":[{"id":"math-1","name":"Chapter 1: Algebra","progress":100,"status":"Mastered"},{"id":"math-2","name":"Chapter 2: Calculus","progress":50,"status":"InProgress"}]}],"exams":[{"id":"exam-1","subjectId":"subj-2","title":"Calculus Midterm","date":"2024-08-01T12:00:00.000Z"}],"timeTable":[]}

---

**OPERATIONAL GUIDELINES:**
-   **Conversation History:** Use the provided history to understand follow-up questions and context.
-   **Data Modification:**
    -   **Adding Items:** When asked to add a task, goal, exam, etc., create a new object and add it to the correct array in the JSON data. Generate a unique ID for new items using \`Date.now().toString()\`.
    -   **Updating Items:** When a user reports progress (e.g., "I read 20 pages"), find the relevant goal and update its 'current' value.
    -   **Finding Items:** When adding chapters or exams, you must find the correct subject by its name to use its ID. If the subject doesn't exist, say so in the conversational part and do not change the JSON.
-   **Date/Time:** Interpret dates and times relative to the current date: ${new Date().toDateString()}.
-   **Data Structure:** Never change the fundamental structure of the JSON data object. Only modify the values and arrays within it.`;


export const processUserCommandStream = async (
    command: string,
    currentData: AppData,
    history: ChatMessage[],
    callbacks: {
        onTextChunk: (chunk: string) => void;
        onTextDone?: (fullText: string) => void;
        onData: (data: AppData) => void;
        onError: (error: string) => void;
        onDone: () => void;
    }
): Promise<void> => {
     if (!process.env.API_KEY) {
        callbacks.onError("I can't help with that right now. The AI assistant is not configured correctly.");
        callbacks.onDone();
        return;
    }
    
    try {
        const userPrompt = `User Command: "${command}"\n\nCurrent User Data:\n${JSON.stringify(currentData, null, 2)}`;

        const historyContents = history.map(msg => ({
           role: msg.sender === 'user' ? 'user' : 'model',
           // Only include the conversational text part of the AI's past responses in the history.
           parts: [{ text: msg.sender === 'ai' ? msg.text.split('---JSON---')[0].trim() : msg.text }]
        })).filter(msg => msg.parts[0].text); // Filter out empty messages, just in case

        const contents = [...historyContents, { role: 'user', parts: [{ text: userPrompt }] }];

        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                thinkingConfig: { thinkingBudget: 0 },
            },
        });

        let textBuffer = '';
        let jsonBuffer = '';
        let foundSeparator = false;
        const separator = '---JSON---';

        for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            if (!chunkText) continue;
            
            if (foundSeparator) {
                jsonBuffer += chunkText;
            } else {
                if (chunkText.includes(separator)) {
                    foundSeparator = true;
                    const parts = chunkText.split(separator);
                    const lastTextChunk = parts[0];
                    callbacks.onTextChunk(lastTextChunk);
                    textBuffer += lastTextChunk;
                    
                    if (callbacks.onTextDone) {
                        callbacks.onTextDone(textBuffer);
                    }

                    jsonBuffer += parts[1] || '';
                } else {
                    callbacks.onTextChunk(chunkText);
                    textBuffer += chunkText;
                }
            }
        }

        if (!foundSeparator && textBuffer) {
             if (callbacks.onTextDone) {
                callbacks.onTextDone(textBuffer);
            }
        }

        if (jsonBuffer.trim()) {
            try {
                // The response may have extra conversational text at the end.
                // We will find the last occurrence of `}` and take everything before it.
                const lastBraceIndex = jsonBuffer.lastIndexOf('}');
                if (lastBraceIndex !== -1) {
                    const cleanJson = jsonBuffer.substring(0, lastBraceIndex + 1);
                    const parsedData = JSON.parse(cleanJson);
                    callbacks.onData(parsedData);
                } else {
                    throw new Error("No closing brace found in JSON response");
                }
            } catch (e) {
                console.error("JSON Parse Error:", e, "JSON:", jsonBuffer);
                callbacks.onError("I had a little trouble processing that, please try again.");
            }
        } else if (!foundSeparator) {
             // If no JSON separator was found, it implies a simple conversational response
             // without data changes. We should still provide the original data back.
             callbacks.onData(currentData);
        }


    } catch (error) {
        console.error("Error processing user command with Gemini:", error);
        callbacks.onError("I'm sorry, I encountered an error. Please try again.");
    } finally {
        callbacks.onDone();
    }
};