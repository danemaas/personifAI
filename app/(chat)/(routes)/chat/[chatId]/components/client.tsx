"use client";

import ChatHeader from "@/components/ChatHeader";
import { Companion, Message } from "@prisma/client";

interface ChatClientProps {
  companion: Companion & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
}

const ChatClient = ({ companion }: ChatClientProps) => {
  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <ChatHeader companion={companion} />
      <h2>Chat Client</h2>
    </div>
  );
};

export default ChatClient;