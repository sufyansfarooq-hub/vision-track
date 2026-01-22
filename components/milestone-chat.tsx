'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Loader2, Plus } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  quickReplies?: string[];
  suggestedMilestones?: string[];
}

interface MilestoneChatProps {
  goalTitle: string;
  goalDescription: string;
  existingMilestones: string[];
  onAddMilestone: (milestone: string) => Promise<void>;
}

export function MilestoneChat({ goalTitle, goalDescription, existingMilestones, onAddMilestone }: MilestoneChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/milestone-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalTitle,
          goalDescription,
          existingMilestones,
          userMessage: null, // Initial message
        }),
      });

      const data = await response.json();
      
      setMessages([
        {
          role: 'assistant',
          content: data.message,
          quickReplies: data.quickReplies,
          suggestedMilestones: data.suggestedMilestones,
        },
      ]);
    } catch (error) {
      console.error('Chat init error:', error);
      setMessages([
        {
          role: 'assistant',
          content: "Hi! I'm here to help you break down your goal into actionable milestones. What would you like to focus on?",
          quickReplies: ["Suggest milestones", "Help me prioritize", "What's the first step?"],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/milestone-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalTitle,
          goalDescription,
          existingMilestones,
          userMessage: messageText,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          quickReplies: data.quickReplies,
          suggestedMilestones: data.suggestedMilestones,
        },
      ]);
    } catch (error) {
      console.error('Send message error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I encountered an error. Please try again.",
          quickReplies: ["Suggest milestones", "Start over"],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const handleAddMilestone = async (milestone: string) => {
    try {
      await onAddMilestone(milestone);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Great! I've added "${milestone}" to your milestones. What's next?`,
          quickReplies: ["Suggest more milestones", "Help me prioritize", "I'm done"],
        },
      ]);
    } catch (error) {
      console.error('Add milestone error:', error);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-md h-[600px] bg-[#1F2937] rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Milestone Assistant</h3>
            <p className="text-xs text-gray-400">Powered by Claude AI</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index}>
            {/* Message Bubble */}
            <div
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#374151] text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>

            {/* Suggested Milestones */}
            {message.suggestedMilestones && message.suggestedMilestones.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-400">Suggested milestones:</p>
                {message.suggestedMilestones.map((milestone, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddMilestone(milestone)}
                    className="w-full text-left px-4 py-2 bg-[#374151] hover:bg-[#4B5563] text-white rounded-lg text-sm flex items-center justify-between group transition"
                  >
                    <span>{milestone}</span>
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-emerald-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Replies */}
            {message.quickReplies && message.quickReplies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickReply(reply)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-full text-sm transition disabled:opacity-50"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#374151] rounded-2xl px-4 py-3">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for milestone suggestions..."
            disabled={isLoading}
            className="flex-1 bg-[#374151] border-0 text-white placeholder:text-gray-500"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
