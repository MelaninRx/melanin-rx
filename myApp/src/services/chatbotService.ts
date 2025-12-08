// Enhanced chatbot service with Firebase chat history integration

import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

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
  stylePreference?: 'standard' | 'visual' | 'wordy';
  includeHistory?: boolean;
}

interface HistoryMessage {
  query: string;
  response: string;
  timestamp: any;
}

// ==========================================
// FIREBASE HISTORY FUNCTIONS
// ==========================================

async function fetchChatHistory(userId: string, limitCount: number = 10): Promise<HistoryMessage[]> {
  try {
    const q = query(
      collection(db, 'ScriptHistory'),
      where('user_id', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    const messages: HistoryMessage[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        query: data.query,
        response: data.response,
        timestamp: data.timestamp
      });
    });
    
    return messages.reverse();
    
  } catch (error) {
    console.error('Error fetching chat history from Firebase:', error);
    return [];
  }
}

function formatHistoryForLangFlow(history: HistoryMessage[]): string {
  if (!history || history.length === 0) {
    return '';
  }
  
  let formatted = 'Previous conversation:\n';
  
  history.forEach((msg, index) => {
    formatted += `User: ${msg.query}\n`;
    formatted += `Assistant: ${msg.response}\n`;
    if (index < history.length - 1) {
      formatted += '\n';
    }
  });
  
  return formatted;
}

async function saveChatToFirebase(userId: string, query: string, response: string): Promise<void> {
  try {
    const userIdValue = !isNaN(Number(userId)) ? Number(userId) : userId;
    
    await addDoc(collection(db, 'ScriptHistory'), {
      user_id: userIdValue,
      query: query,
      response: response,
      timestamp: serverTimestamp()
    });
    
    console.log('Chat saved to Firebase ScriptHistory successfully');
    
  } catch (error) {
    console.error('Error saving chat to Firebase:', error);
  }
}

// ==========================================
// ENHANCED CHATBOT FUNCTION
// ==========================================

export async function sendMessageToChatbot(options: SendMessageOptions): Promise<string> {
  const { 
    message, 
    userName = "Guest", 
    userId = "anon",
    stylePreference = "standard",
    includeHistory = true
  } = options;

  try {
    let finalMessage = message;
    
    if (includeHistory && userId !== "anon") {
      console.log('Fetching conversation history for user:', userId);
      const chatHistory = await fetchChatHistory(userId, 10);
      
      if (chatHistory.length > 0) {
        const formattedHistory = formatHistoryForLangFlow(chatHistory);
        finalMessage = `${formattedHistory}\n\nCurrent question:\n${message}`;
        console.log('Including conversation history with', chatHistory.length, 'previous messages');
      }
    }
    
    console.log("Sending message to Firebase Function:", LANGFLOW_PROXY_URL);
    
    const res = await fetch(LANGFLOW_PROXY_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        message: finalMessage,
        user: { 
          name: userName, 
          id: userId 
        },
        stylePreference: stylePreference
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

    if (userId !== "anon") {
      saveChatToFirebase(userId, message, botReply).catch(err => {
        console.error('Failed to save chat history:', err);
      });
    }

    return botReply;
  } catch (error) {
    console.error("LangFlow error:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Error connecting to LangFlow.";
    throw new Error(errorMessage);
  }
}

export async function sendStandaloneMessage(options: Omit<SendMessageOptions, 'includeHistory'>): Promise<string> {
  return sendMessageToChatbot({
    ...options,
    includeHistory: false
  });
}

export {
  fetchChatHistory,
  formatHistoryForLangFlow,
  saveChatToFirebase
};