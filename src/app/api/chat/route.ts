import { tools } from "@/src/lib/tools";
import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";

// Allow streaming responses up to 45 seconds
export const maxDuration = 45;

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = streamText({
    model: groq("qwen-qwq-32b"),
    tools,
    maxSteps: 10,
    messages,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onStepFinish: (event: any) => {
      console.log(event.toolResults);
    },
  });
  
  console.log("🚀 ~ POST ~ messages:", result)
  return result.toDataStreamResponse();
}
