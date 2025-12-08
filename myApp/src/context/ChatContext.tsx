import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { getFirestore, doc, collection, addDoc, getDocs, updateDoc, query, orderBy } from "firebase/firestore";
import { useCurrentUser } from "../hooks/useCurrentUser";

interface ChatMessage {
  sender: string;
  text: string;
}

interface Conversation {
  id: string;
  messages: ChatMessage[];
  timestamp: string;
}

interface ChatContextType {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  savedConversations: Conversation[];
  currentConversationId: string | null;
  handleNewChat: () => void;
  handleLoadConversation: (conv: Conversation) => void;
  saveOrUpdateConversation: (messages: ChatMessage[]) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [savedConversations, setSavedConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const user = useCurrentUser();

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.uid) return;
      const db = getFirestore();
      const convRef = collection(db, "users", user.uid, "chatHistory");
      const q = query(convRef, orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      // Ensure each conversation includes its Firestore document ID as 'id'
      const convs = snapshot.docs.map((doc) => ({
        id: doc.id, // <-- this is critical
        ...doc.data(),
      }));
      setSavedConversations(convs as Conversation[]);
    };
    fetchConversations();
  }, [user]);

  const saveOrUpdateConversation = async (messages: ChatMessage[]) => {
    if (!user?.uid || messages.length === 0) return;
    const db = getFirestore();
    const convRef = collection(db, "users", user.uid, "chatHistory");
    try {
      if (currentConversationId) {
        const docRef = doc(db, "users", user.uid, "chatHistory", currentConversationId);
        await updateDoc(docRef, {
          messages,
          timestamp: new Date().toISOString(),
        });
      } else {
        const docRef = await addDoc(convRef, {
          messages,
          timestamp: new Date().toISOString(),
        });
        setCurrentConversationId(docRef.id);
      }
      // refresh conversation list
      const q = query(convRef, orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const convs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSavedConversations(convs as Conversation[]);
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  const handleNewChat = () => {
    setChatHistory([]);
    setCurrentConversationId(null);
  };

  const handleLoadConversation = (conv: Conversation) => {
    console.log('[ChatContext] handleLoadConversation called with:', conv);
    console.log('[ChatContext] conv.id:', conv.id);
    console.log('[ChatContext] conv.messages:', conv.messages);
    setChatHistory(conv.messages || []);
    setCurrentConversationId(conv.id || null);
  };

  return (
    <ChatContext.Provider
      value={{
        chatHistory,
        setChatHistory,
        savedConversations,
        currentConversationId,
        handleNewChat,
        handleLoadConversation,
        saveOrUpdateConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
