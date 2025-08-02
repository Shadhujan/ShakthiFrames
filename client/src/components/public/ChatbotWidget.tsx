// ----------------- START OF FINAL, CORRECTED ChatbotWidget.tsx -----------------

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { sendMessageToBot } from '@/api/chatbotApi';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! How can I assist you with your framing needs today?", isBot: true },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the bottom when new messages are added
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = { id: Date.now(), text: message, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = message;
    setMessage('');
    setIsLoading(true);

    try {
      const { reply } = await sendMessageToBot(currentInput);
      const botResponse: Message = { id: Date.now() + 1, text: reply, isBot: true };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorResponse: Message = { id: Date.now() + 1, text: "Sorry, an error occurred. Please try again.", isBot: true };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Widget Window */}
      {isOpen && (
        // The main container uses flexbox to structure the header, content, and footer
        <Card className="fixed bottom-24 right-4 w-80 h-[500px] shadow-xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b">
            <CardTitle className="text-lg font-medium">Chat Support</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          {/* --- THIS IS THE SCROLLABLE AREA --- */}
          {/* `flex-1` makes this div grow to fill available space. */}
          {/* `overflow-y-auto` adds the vertical scrollbar only when needed. */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${msg.isBot ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            {/* This empty div is the anchor for our auto-scroll */}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input area is fixed at the bottom */}
          <div className="p-4 border-t flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} size="icon" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </Card>
      )}

      {/* Main Chat Button to open/close the widget */}
      <Button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg z-40">
        {isOpen ? <X className="h-8 w-8" /> : <MessageCircle className="h-8 w-8" />}
      </Button>
    </>
  );
};

export default ChatbotWidget;