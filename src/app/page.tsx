"use client";

import { useChat } from "@ai-sdk/react";
import {
  Copy,
  RotateCcw,
  SendHorizontal,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import { parseUnits } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { useUpProvider } from "../components/upProvider";

// Donation constants
const MIN_DONATION_AMOUNT = 0.001;
const MAX_DONATION_AMOUNT = 1000;

function ChatContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { client, accounts, walletConnected } = useUpProvider();

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      maxSteps: 5,
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === "donateLyx") {
          try {
            if (!client || !walletConnected || accounts.length === 0) {
              return JSON.stringify({
                error:
                  "Wallet not connected. Please connect your UP Browser wallet first.",
              });
            }

            const { recipientAddress, amount } = toolCall.args as {
              recipientAddress: string;
              amount: number;
            };

            // Validate amount
            if (amount < MIN_DONATION_AMOUNT || amount > MAX_DONATION_AMOUNT) {
              return JSON.stringify({
                error: `Amount must be between ${MIN_DONATION_AMOUNT} and ${MAX_DONATION_AMOUNT} LYX`,
              });
            }

            // Validate recipient address
            if (!recipientAddress || !recipientAddress.startsWith("0x")) {
              return JSON.stringify({
                error: "Invalid recipient address format",
              });
            }

            const tx = await client.sendTransaction({
              account: accounts[0] as `0x${string}`,
              to: recipientAddress as `0x${string}`,
              value: parseUnits(amount.toString(), 18),
              chain: client.chain,
            });

            // Wait for transaction confirmation
            await waitForTransactionReceipt(client, { hash: tx });

            return JSON.stringify({
              success: true,
              txHash: tx,
              message: `Successfully sent ${amount} LYX to ${recipientAddress}`,
            });
          } catch (error) {
            console.error("Donation failed:", error);
            return JSON.stringify({
              error:
                "Transaction failed. Please check your wallet and try again.",
            });
          }
        }
      },
    });
  console.log("🚀 ~ ChatContent ~ messages:", messages);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await handleSubmit(e);
    setIsSubmitting(false);
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between p-4 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
        {/* <button
					type="button"
					className="p-2 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
				>
					<Menu className="w-5 h-5" />
				</button> */}
        <h1 className="text-xl font-bold text-zinc-100">LukUp</h1>
        {/* <div className="rounded-full bg-zinc-800 px-4 py-2 text-zinc-100 text-sm">
					Connect Wallet
				</div> */}
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-0 h-screen w-full overflow-hidden flex flex-col">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === "user" ? "justify-end ml-12" : "mr-12"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white flex-shrink-0">
                  AI
                </div>
              )}
              <div
                className={`flex flex-col ${
                  message.role === "user" ? "items-end" : ""
                }`}
              >
                <div
                  className={`group flex flex-col gap-2 ${
                    message.role === "user" ? "items-end" : ""
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.role === "user"
                        ? "bg-zinc-800 text-zinc-100"
                        : "bg-zinc-900 text-zinc-100"
                    }`}
                  >
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500">
                    {new Date().toLocaleTimeString("en-US", {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="border-t border-zinc-800 p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={onSubmit} className="w-full relative">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => handleInputChange(e)}
                  placeholder="Message LukUp..."
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-md py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-zinc-700 resize-none min-h-[50px]"
                  disabled={isSubmitting}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSubmit(e);
                    }
                  }}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <button
                    type="submit"
                    disabled={!input.trim() || isSubmitting}
                    className="p-2 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isLoading ? "Stop generation" : "Send message"}
                  >
                    {isLoading ? (
                      <RotateCcw className="w-5 h-5 animate-spin" />
                    ) : (
                      <SendHorizontal className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Chat() {
  return (
    <ChatContent />
  );
}
