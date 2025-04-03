import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";

dotenv.config();

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

// The bucket name to use
const bucketName = process.env.R2_BUCKET || "images-bucket";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    const { path } = req.query;
    
    if (!path || !Array.isArray(path) || path.length === 0) {
      return res.status(400).end("Invalid path");
    }

    // Construct the key from the path segments
    const key = path.join("/");
    
    console.log(`Retrieving object from R2: bucket=${bucketName}, key=${key}`);

    // Get the object from R2
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const { Body, ContentType } = await s3Client.send(command);
    
    if (!Body) {
      return res.status(404).end("Image not found");
    }

    // Convert the stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Set cache control headers
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    
    // Set content type
    res.setHeader("Content-Type", ContentType || "image/webp");
    
    // Return the image data
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Error retrieving image from R2:", error);
    return res.status(500).end("Error retrieving image");
  }
}
