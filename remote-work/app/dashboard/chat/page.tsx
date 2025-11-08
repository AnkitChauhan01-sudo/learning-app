"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  userId: string;
  userName?: string;
  createdAt: string;
}

export default function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/chat/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch and polling setup
    fetchMessages();
    // Poll for new messages every 2 seconds
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600 dark:text-gray-400">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Team Chat
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Communicate with your team in real-time
        </p>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.userId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    {!isOwnMessage && (
                      <div className="text-xs font-semibold mb-1 opacity-75">
                        {message.userName || "Unknown User"}
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div
                      className={`text-xs mt-2 ${
                        isOwnMessage ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

