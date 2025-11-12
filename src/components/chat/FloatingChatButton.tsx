import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatInterface from './ChatInterface';

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="fixed bottom-24 right-6 rounded-full w-14 h-14 shadow-lg z-40 bg-accent hover:bg-accent/90"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-card border rounded-lg shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">AI Waiter</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ChatInterface />
        </div>
      )}
    </>
  );
}
