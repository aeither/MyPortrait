// Import necessary modules
import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
  } from "@aws-sdk/client-s3";
  import dotenv from "dotenv";
  import { experimental_generateImage as generateImage } from "ai";
  import { NextApiRequest, NextApiResponse } from "next";
  import { replicate } from "@ai-sdk/replicate";
  
  dotenv.config();

  // Configure S3 client for Cloudflare R2
  const s3Client = new S3Client({
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
    endpoint: process.env.R2_ENDPOINT || "",
    region: "auto", // R2 uses "auto" as the region
  });
  
  const bucketName = process.env.R2_BUCKET || "images-bucket";
  
  // Define the response type
  type ApiResponse = {
    imageUrl?: string;
    error?: string;
    success: boolean;
  };
  
  // API handler for generating and storing images
  export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>
  ) {
    // Only allow POST requests
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed", success: false });
    }
  
    try {
      // Parse the request body
      const { prompt, systemPrompt, userId } = req.body;
  
      if (!prompt || !userId) {
        return res.status(400).json({
          error: "Prompt and userId are required",
          success: false,
        });
      }
  
      // Default system prompt with a whimsical art style
      const finalSystemPrompt =
        systemPrompt ||
        "Create a portrait with a whimsical, hand-drawn animation style. Use soft, watercolor-like backgrounds, vibrant colors, and expressive eyes. The character should have a sense of wonder and innocence, with detailed but simplified features. Include delicate background elements like flowing grass, sparkles, or soft clouds to evoke a dreamy, nostalgic atmosphere.";
  
      // Generate image using Replicate
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
            num_inference_steps: 4,
          },
        },
      });
  
      if (!result.images || result.images.length === 0 || !result.images[0].base64) {
        throw new Error("No image generated");
      }
  
      // Convert base64 to Buffer for storage
      const imageBuffer = Buffer.from(result.images[0].base64, "base64");
  
      // Store the image in R2 bucket
      const key = `users/${userId}/generated-image.webp`;
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: imageBuffer,
        ContentType: "image/webp",
      });
      await s3Client.send(command);
  
      console.log(`Image for user ${userId} stored successfully`);
  
      // Return the URL of the stored image
      const imageUrl = `${process.env.R2_ENDPOINT}/${bucketName}/${key}`;
      return res.status(200).json({ imageUrl, success: true });
    } catch (error) {
      console.error("Error generating or storing image:", error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to generate or store image",
        success: false,
      });
    }
  }
  
  // Function to retrieve an image from R2
  export async function retrieveImage(userId: string): Promise<string | null> {
    try {
      const key = `users/${userId}/generated-image.webp`;
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
  
      const response = await s3Client.send(command);
      const bodyContents = await response.Body?.transformToString("base64");
      
      if (bodyContents) {
        return bodyContents; // Return base64 string of the image
      }
  
      console.log(`No image found for user ${userId}`);
      return null;
    } catch (error) {
      console.error(`Failed to retrieve image for user ${userId}:`, error);
      return null;
    }
  }
