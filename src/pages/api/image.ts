import { experimental_generateImage as generateImage } from "ai";
import { NextApiRequest, NextApiResponse } from "next";
import { replicate } from "@ai-sdk/replicate";

// Define the response type
type ApiResponse = {
  image?: string;
  error?: string;
  success: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', success: false });
  }

  try {
    // Parse the request body
    const { prompt, systemPrompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        error: "Prompt is required", 
        success: false 
      });
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
    return res.status(200).json({ 
      image: result.images[0].base64,
      success: true
    });
  } catch (error) {
    console.error("Error generating image:", error);
    
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to generate image",
      success: false
    });
  }
}
