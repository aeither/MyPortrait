import {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { experimental_generateImage as generateImage } from "ai";
import { NextApiRequest, NextApiResponse } from "next";
import { replicate } from "@ai-sdk/replicate";
import { getPortraitByAddress, savePortrait } from "../../db/portraits";

dotenv.config();

// The bucket name to use
const bucketName = process.env.R2_BUCKET || "images-bucket";

// Configure S3 client for Cloudflare R2
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  endpoint: process.env.R2_ENDPOINT || "",
  region: "auto",
  forcePathStyle: true,
});

// The public facing URL for accessing stored images
const publicBaseUrl = "/api/image";

// Define the response types
type ApiResponse = {
  imageUrl?: string;
  imageData?: string;
  error?: string;
  success: boolean;
};

// Ensure the bucket exists
async function ensureBucketExists() {
  try {
    // Check if bucket exists
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`Bucket ${bucketName} exists`);
      return true;
    } catch (error) {
      console.log(`Bucket ${bucketName} does not exist, creating...`);
      
      // Create bucket if it doesn't exist
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log(`Bucket ${bucketName} created successfully`);
      return true;
    }
  } catch (error) {
    console.error(`Failed to ensure bucket exists: ${error}`);
    return false;
  }
}

/**
 * API handler for portrait operations:
 * - GET: Retrieve a portrait for an address
 * - POST: Generate a new portrait
 * - PUT: Save a generated portrait to R2 and database
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // GET: Retrieve portrait for an address
  if (req.method === "GET") {
    try {
      const { address } = req.query;
      
      if (!address || typeof address !== "string") {
        return res.status(400).json({
          error: "Address is required",
          success: false,
        });
      }
      
      // First check the database for existing portrait
      const portraitData = await getPortraitByAddress(address);
      
      if (!portraitData) {
        return res.status(404).json({
          error: "No portrait found for this address",
          success: false,
        });
      }
      
      // Return the stored URL - we'll let the client fetch the image
      return res.status(200).json({
        imageUrl: portraitData?.imageUrl, 
        success: true,
      });
    } catch (error) {
      console.error("Error retrieving portrait:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to retrieve portrait",
        success: false,
      });
    }
  }
  
  // POST: Generate a new portrait (not saved yet)
  else if (req.method === "POST") {
    try {
      const { prompt, systemPrompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({
          error: "Prompt is required",
          success: false,
        });
      }
      
      // Default system prompt with Studio Ghibli-inspired art style
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
            num_inference_steps: 4,
          },
        },
      });
      
      if (!result.images || result.images.length === 0 || !result.images[0].base64) {
        throw new Error("No image generated");
      }
      
      // Return the image in base64 format
      return res.status(200).json({
        imageData: result.images[0].base64,
        success: true,
      });
    } catch (error) {
      console.error("Error generating portrait:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to generate portrait",
        success: false,
      });
    }
  }
  
  // PUT: Save a generated portrait to R2 and database
  else if (req.method === "PUT") {
    try {
      const { address, imageData, prompt } = req.body;
      
      if (!address || !imageData) {
        return res.status(400).json({
          error: "Address and image data are required",
          success: false,
        });
      }
      
      // First ensure the bucket exists
      const bucketReady = await ensureBucketExists();
      if (!bucketReady) {
        throw new Error("Failed to ensure R2 bucket exists");
      }
      
      // Convert base64 to Buffer for storage
      const imageBuffer = Buffer.from(imageData, "base64");
      
      // Store the image in R2 bucket
      const key = `portraits/${address.toLowerCase()}.webp`;
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: imageBuffer,
        ContentType: "image/webp",
      });
      
      console.log("Uploading to R2:", { bucket: bucketName, key });
      
      try {
        await s3Client.send(command);
        console.log("Upload successful");
      } catch (uploadError) {
        console.error("R2 upload error details:", JSON.stringify(uploadError));
        throw uploadError;
      }
      
      // Generate the public URL - for Cloudflare R2
      const imageUrl = `${publicBaseUrl}/portraits/${address.toLowerCase()}.webp`;
      console.log("Generated image URL:", imageUrl);
      
      // Save to database
      const saved = await savePortrait(address, imageUrl, prompt);
      
      if (!saved) {
        throw new Error("Failed to save portrait to database");
      }
      
      console.log(`Portrait for address ${address} saved successfully`);
      
      return res.status(200).json({
        imageUrl,
        success: true,
      });
    } catch (error) {
      console.error("Error saving portrait:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to save portrait",
        success: false,
      });
    }
  }
  
  // Method not allowed
  else {
    return res.status(405).json({
      error: "Method not allowed",
      success: false,
    });
  }
}

// Helper function to retrieve an image from R2 as base64
export async function retrieveImageFromR2(address: string): Promise<string | null> {
  try {
    const key = `portraits/${address.toLowerCase()}.webp`;
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    const response = await s3Client.send(command);
    
    if (!response.Body) {
      return null;
    }
    
    const bodyContents = await response.Body.transformToString("base64");
    return bodyContents;
  } catch (error) {
    console.error(`Failed to retrieve image for address ${address}:`, error);
    return null;
  }
}
