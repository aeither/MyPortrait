import { db } from "./drizzle";
import { portraits } from "./schema";
import { eq } from "drizzle-orm";

export type PortraitRecord = {
  address: string;
  imageUrl: string;
  prompt?: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Retrieves a portrait for a specific wallet address
 * @param address Wallet address to fetch portrait for
 * @returns Portrait data or null if not found
 */
export async function getPortraitByAddress(address: string): Promise<PortraitRecord | null> {
  try {
    const normalizedAddress = address.toLowerCase();
    console.log(`Looking up portrait for address: ${normalizedAddress}`);

    const result = await db.select().from(portraits).where(eq(portraits.address, normalizedAddress)).limit(1);

    if (result.length === 0) {
      console.log("No portrait found for this address");
      return null;
    }

    const portrait = result[0];
    console.log("Found portrait:", portrait);

    return {
      address: portrait.address,
      imageUrl: portrait.imageUrl,
      prompt: portrait.prompt || undefined,
      createdAt: portrait.createdAt,
      updatedAt: portrait.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching portrait:", error);
    return null;
  }
}

/**
 * Saves a portrait for a wallet address
 * If the address already exists, the portrait will be updated
 * If the address doesn't exist, a new portrait will be created
 * 
 * @param address Wallet address
 * @param imageUrl R2 URL of the saved image
 * @param prompt Optional prompt used to generate the image
 * @returns True if saved successfully, false otherwise
 */
export async function savePortrait(address: string, imageUrl: string, prompt?: string): Promise<boolean> {
  try {
    const normalizedAddress = address.toLowerCase();
    const now = new Date().toISOString();

    console.log(`Saving portrait for address: ${normalizedAddress}, imageUrl: ${imageUrl}`);

    // Check if the portrait already exists
    const existingPortrait = await getPortraitByAddress(normalizedAddress);

    if (existingPortrait) {
      // Update existing portrait
      await db.update(portraits)
        .set({
          imageUrl,
          prompt: prompt || existingPortrait.prompt,
          updatedAt: now,
        })
        .where(eq(portraits.address, normalizedAddress));

      console.log("Updated existing portrait successfully");
    } else {
      // Insert new portrait
      await db.insert(portraits).values({
        address: normalizedAddress,
        imageUrl,
        prompt,
        createdAt: now,
        updatedAt: now,
      });

      console.log("Inserted new portrait successfully");
    }

    return true;
  } catch (error) {
    console.error("Error saving portrait:", error);
    return false;
  }
}
