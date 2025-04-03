import { db } from "../src/db/drizzle";
import { portraits } from "../src/db/schema";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config();

/**
 * This script updates existing portrait image URLs in the database
 * from the old format (direct R2 URLs) to the new API route format.
 */
async function updateImageUrls() {
  try {
    console.log("Starting URL migration...");
    
    // Get all portraits from the database
    const allPortraits = await db.select().from(portraits);
    console.log(`Found ${allPortraits.length} portraits to update`);
    
    const oldBaseUrl = process.env.R2_ENDPOINT || "";
    const bucketName = process.env.R2_BUCKET || "images-bucket";
    const newBaseUrl = "/api/image";
    
    // Process each portrait
    for (const portrait of allPortraits) {
      const oldUrl = portrait.imageUrl;
      
      // Only update URLs that match the old format
      if (oldUrl.startsWith(oldBaseUrl)) {
        // Extract just the key part
        const key = oldUrl.split(`${bucketName}/`)[1];
        
        // Create the new URL using the API route
        const newUrl = `${newBaseUrl}/${key}`;
        
        // Update the database
        await db.update(portraits)
          .set({ imageUrl: newUrl })
          .where(eq(portraits.address, portrait.address));
        
        console.log(`Updated portrait for ${portrait.address}:\n  Old: ${oldUrl}\n  New: ${newUrl}`);
      } else {
        console.log(`Skipping portrait for ${portrait.address} - already using new URL format`);
      }
    }
    
    console.log("URL migration completed successfully");
  } catch (error) {
    console.error("Error updating image URLs:", error);
  } finally {
    process.exit(0);
  }
}

updateImageUrls();
