"use client";
import { Companion } from "@prisma/client";
import React, { ElementRef, useEffect, useRef, useState } from "react";
import ChatMessage, { ChatMessageProps } from "./ChatMessage";

interface ChatMessagesProps {
  isLoading: boolean;
  companion: Companion;
  messages: ChatMessageProps[];
}

const ChatMessages = ({
  companion,
  isLoading,
  messages = [],
}: ChatMessagesProps) => {
  const scrollRef = useRef<ElementRef<"div">>(null);
  const [fakeLoading, setFakeLoading] = useState(
    messages.length === 0 ? true : false
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFakeLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto pr-4">
      <ChatMessage
        src={companion.src}
        role="system"
        content={`Hello, I am ${companion.name}. ${companion.description}`}
        isLoading={fakeLoading}
      />
      {messages.map((message) => (
        <ChatMessage
          key={message.content}
          role={message.role}
          content={message.content}
          src={companion.src}
        />
      ))}
      {isLoading && <ChatMessage role="system" src={companion.src} isLoading />}
      <div ref={scrollRef} />
    </div>
  );
};

export default ChatMessages;
