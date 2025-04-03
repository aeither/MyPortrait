import { experimental_generateImage as generateImage } from "ai";
import { NextResponse } from "next/server";
import { replicate } from "@ai-sdk/replicate";

// Allow longer responses for image generation
export const maxDuration = 60;

// Define the expected request body type
interface GenerateRequest {
  prompt: string;
  systemPrompt?: string;
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json() as GenerateRequest;
    const { prompt, systemPrompt } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Default system prompt with whimsical, anime-inspired art style (without mentioning Ghibli directly)
    const finalSystemPrompt = systemPrompt || 
      "Create a portrait with a whimsical, hand-drawn animation style. Use soft, watercolor-like backgrounds, vibrant colors, and expressive eyes. The character should have a sense of wonder and innocence, with detailed but simplified features. Include delicate background elements like flowing grass, sparkles, or soft clouds to evoke a dreamy, nostalgic atmosphere.";
    
    // Generate image using the AI SDK with Replicate
    const result = await generateImage({
      model: replicate.image("black-forest-labs/flux-schnell"),
      prompt: `${finalSystemPrompt}: ${prompt}`,
      n: 1,
      providerOptions: {
        replicate: {
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          num_inference_steps: 4, // Reduced for faster generation with Flux model
        },
      },
    });

    if (!result.images || result.images.length === 0 || !result.images[0].base64) {
      throw new Error("No image generated");
    }

    // Return the image in base64 format
    return NextResponse.json({ 
      image: result.images[0].base64,
      success: true
    });
  } catch (error) {
    console.error("Error generating image:", error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate image",
        success: false
      },
      { status: 500 }
    );
  }
}
