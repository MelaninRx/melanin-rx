// Shared chatbot service for sending messages to LangFlow

const FIREBASE_PROJECT_ID = "melaninrx-4842c";
const FIREBASE_REGION = "us-central1";
const LANGFLOW_PROXY_URL = `https://${FIREBASE_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/chatWithLangFlow`;

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp?: Date;
}

export interface SendMessageOptions {
  message: string;
  userName?: string;
  userId?: string;
}

/**
 * Send a message to the LangFlow chatbot
 */
export async function sendMessageToChatbot(options: SendMessageOptions): Promise<string> {
  const { message, userName = "Guest", userId = "anon" } = options;

  try {
    console.log("Sending message to Firebase Function:", LANGFLOW_PROXY_URL);
    
    const res = await fetch(LANGFLOW_PROXY_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        message, 
        user: { 
          name: userName, 
          id: userId 
        } 
      }),
    });

    console.log("Response status:", res.status);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
      console.error("Error response from Firebase Function:", errorData);
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("LangFlow response:", data);

    const botReply =
      data.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
      "No response from LangFlow.";

    return botReply;
  } catch (error) {
    console.error("LangFlow error:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Error connecting to LangFlow.";
    throw new Error(errorMessage);
  }
}