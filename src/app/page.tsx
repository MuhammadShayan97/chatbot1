
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import rules from "./rules.json";

type Rule = {
  intent: string;
  keywords: string[];
  reply: string;
};

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

const chatbotRules = rules as Rule[];

const GREETING =
  "Assalam-o-Alaikum! 👋 Welcome to UOS Helpdesk Bot. Main University of Sargodha ke students ki madad ke liye yahan hoon. Aap English ya Roman Urdu mein admissions, fees, exams, departments, library, hostel aur student services ke bare mein sawal pooch sakte hain.";

const FALLBACK =
  "Sorry, mujhe aapke sawal ka matching jawab nahi mila. 😊 Admissions, fees, departments, exams, library, hostel ya student services ke bare mein pooch kar dekhein.";

function normalizeMessage(message: string): string {
  return message
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function getBotReply(message: string): string {
  const normalizedMessage = normalizeMessage(message);

  if (!normalizedMessage) {
    return "Please apna sawal type karein.";
  }

  const paddedMessage = ` ${normalizedMessage} `;

  let bestMatch: Rule | null = null;
  let longestKeywordLength = 0;

  for (const rule of chatbotRules) {
    if (rule.intent === "fallback") continue;

    for (const keyword of rule.keywords) {
      const normalizedKeyword = normalizeMessage(keyword);

      if (!normalizedKeyword) continue;

      const paddedKeyword = ` ${normalizedKeyword} `;

      if (
        paddedMessage.includes(paddedKeyword) &&
        normalizedKeyword.length > longestKeywordLength
      ) {
        bestMatch = rule;
        longestKeywordLength = normalizedKeyword.length;
      }
    }
  }

  return bestMatch?.reply ?? FALLBACK;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: GREETING,
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const userMessage = input.trim();

    if (!userMessage || isTyping) return;

    const userChatMessage: Message = {
      id: nextId.current++,
      sender: "user",
      text: userMessage,
    };

    const botChatMessage: Message = {
      id: nextId.current++,
      sender: "bot",
      text: getBotReply(userMessage),
    };

    setMessages((previous) => [
      ...previous,
      userChatMessage,
    ]);

    setInput("");
    setIsTyping(true);

    typingTimer.current = setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        botChatMessage,
      ]);

      setIsTyping(false);
      typingTimer.current = null;
    }, 350);
  }

  const suggestions = [
    "Admission ki last date kya hai?",
    "Fee structure",
    "BS Media Studies",
    "Exam date sheet",
    "Hostel application",
    "Library card",
  ];

  function askQuestion(question: string) {
    if (isTyping) return;
    setInput(question);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-3 py-5 text-slate-100 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl sm:min-h-[calc(100vh-4rem)]">
        <header className="flex items-center gap-3 border-b border-white/10 bg-slate-900 px-4 py-4 sm:px-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-xl font-bold text-white shadow-lg">
            U
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold tracking-tight sm:text-xl">
              UOS Helpdesk Bot
            </h1>

            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              University of Sargodha · Student Support
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-emerald-300">
              Ready
            </span>
          </div>
        </header>

        <section
          aria-label="Chat conversation"
          aria-live="polite"
          className="flex flex-1 flex-col overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 px-3 py-5 sm:px-6 sm:py-6"
        >
          <div className="mb-6 text-center">
            <span className="inline-block rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs text-slate-400">
              Your university assistance desk
            </span>
          </div>

          <div className="space-y-5">
            {messages.map((message) => {
              const isUser = message.sender === "user";

              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2.5 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-sm font-bold text-cyan-300 ring-1 ring-blue-400/20"
                    >
                      U
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[78%] ${
                      isUser
                        ? "rounded-br-md bg-gradient-to-br from-blue-600 to-blue-500 text-white"
                        : "rounded-bl-md border border-slate-700/80 bg-slate-800 text-slate-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.text}
                    </p>

                    <p
                      className={`mt-1 text-[10px] ${
                        isUser
                          ? "text-blue-100/75"
                          : "text-slate-500"
                      }`}
                    >
                      {isUser ? "You" : "UOS Helpdesk Bot"}
                    </p>
                  </div>

                  {isUser && (
                    <div
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-[10px] font-semibold text-slate-200"
                    >
                      You
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div
                role="status"
                aria-label="Bot is responding"
                className="flex items-end gap-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 text-sm font-bold text-cyan-300">
                  U
                </div>

                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-700 bg-slate-800 px-4 py-4">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </section>

        <div className="border-t border-white/5 bg-slate-900 px-3 pb-3 pt-4 sm:px-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
            Quick questions
          </p>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={isTyping}
                onClick={() => askQuestion(suggestion)}
                className="rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 transition hover:border-blue-400/60 hover:bg-blue-500/10 hover:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-white/10 bg-slate-900 p-3 sm:px-6 sm:py-5"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 p-2 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
            <label htmlFor="chat-input" className="sr-only">
              Type your question
            </label>

            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Apna sawal likhein..."
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Send</span>

              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2 11 13" />
                <path d="m22 2-7 20-4-9-9-4Z" />
              </svg>
            </button>
          </div>

          <p className="mt-3 text-center text-[11px] text-slate-500">
            Rule-based chatbot · English + Roman Urdu
          </p>
        </form>
      </div>
    </main>
  );
}
