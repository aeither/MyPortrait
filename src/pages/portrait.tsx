"use client";

import { useSearchParams } from "next/navigation";
import { useState, useCallback, Suspense, useEffect } from "react";
import Image from "next/image";
import { UpProvider, useUpProvider } from "../components/upProvider";
import ClientOnly from "../components/ClientOnly";

// Separate component that uses useSearchParams
function PortraitContent() {
  const searchParams = useSearchParams();
  const { accounts, walletConnected } = useUpProvider();

  // Get address from URL params
  const addressParam = searchParams.get("address");
  const address = addressParam ? addressParam.toLowerCase() : null;

  // Get connected wallet address
  const connectedAddress = accounts.length > 0
    ? accounts[0].toLowerCase()
    : null;

  // State for image and prompt
  const [imageUrl, setImageUrl] = useState("");
  const [tempImageData, setTempImageData] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasPortrait, setHasPortrait] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now()); // Add timestamp for cache busting

  // Check if the user is the owner of this portrait
  const isOwner = walletConnected && address === connectedAddress;

  // Fetch existing portrait on load
  useEffect(() => {
    async function fetchPortrait() {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/portrait?address=${address}`);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.imageUrl) {
            // Add timestamp as a query parameter to bust the cache
            setImageUrl(`${data.imageUrl}?t=${timestamp}`);
            setHasPortrait(true);
            setPrompt(data.prompt || "");
          }
        } else {
          console.log("No existing portrait found");
        }
      } catch (error) {
        console.error("Error fetching portrait:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPortrait();
  }, [address, timestamp]);

  // Handle image generation
  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a description for your portrait");
      return;
    }

    try {
      setIsGenerating(true);
      setError("");

      const response = await fetch("/api/portrait", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          systemPrompt: "Create a portrait with a whimsical, hand-drawn animation style. Use soft, watercolor-like backgrounds, vibrant colors, and expressive eyes. The character should have a sense of wonder and innocence, with detailed but simplified features."
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate image");
      }

      // Save the generated image data to state (not saved to R2 yet)
      setTempImageData(data.imageData);

      // Display the image in the UI
      setImageUrl(`data:image/webp;base64,${data.imageData}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate image";
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt]);

  // Handle saving the generated image to R2 and database
  const handleSavePortrait = useCallback(async () => {
    if (!address || !tempImageData) {
      setError("Cannot save without an address and image");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const response = await fetch("/api/portrait", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          imageData: tempImageData,
          prompt
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save portrait");
      }

      // Update the image URL to the saved R2 URL with timestamp for cache busting
      const newTimestamp = Date.now();
      setImageUrl(`${data.imageUrl}?t=${newTimestamp}`);
      setTimestamp(newTimestamp);
      setTempImageData(""); // Clear the temporary image data
      setHasPortrait(true); // Mark that we now have a portrait

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save portrait";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [address, tempImageData, prompt]);

  // Handle canceling the portrait generation
  const handleCancelGeneration = useCallback(() => {
    setTempImageData("");
    setError("");

    // If we had an existing portrait, restore it
    if (hasPortrait) {
      fetch(`/api/portrait?address=${address}`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.imageUrl) {
            // Add timestamp as a query parameter to bust the cache
            setImageUrl(`${data.imageUrl}?t=${timestamp}`);
          }
        })
        .catch(err => {
          console.error("Error restoring portrait:", err);
        });
    } else {
      setImageUrl(""); // No existing portrait, clear the image
    }
  }, [address, hasPortrait, timestamp]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-zinc-900 to-black">
      <div className="w-full max-w-xl flex flex-col gap-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-amber-500 tracking-tight">
            {isOwner ? "Your Portrait" : "Portrait"}
          </h1>
        </div>

        {/* Portrait Card with Luxurious Frame */}
        <div className="aspect-square flex flex-col relative rounded-xl overflow-hidden">
          {/* Ornate Frame - Top Edge */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 z-10"></div>

          {/* Ornate Frame - Left & Right Edges */}
          <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-b from-amber-600 via-yellow-400 to-amber-600 z-10"></div>
          <div className="absolute top-0 right-0 w-4 h-full bg-gradient-to-b from-amber-600 via-yellow-400 to-amber-600 z-10"></div>

          {/* Ornate Frame - Bottom Edge */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 z-10"></div>

          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 bg-amber-500 rounded-br-lg z-20"></div>
          <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500 rounded-bl-lg z-20"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 bg-amber-500 rounded-tr-lg z-20"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 rounded-tl-lg z-20"></div>

          {/* Main Content Area - Only the Image */}
          <div className="flex-1 flex items-center justify-center bg-zinc-900 m-4 rounded-lg overflow-hidden z-0">
            <div className="relative w-full h-full rounded-lg overflow-hidden bg-zinc-800 shadow-xl">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                  <p className="text-zinc-400 mt-4">Loading portrait...</p>
                </div>
              ) : imageUrl ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 z-10"></div>
                  <Image
                    src={imageUrl}
                    alt="User Portrait"
                    fill
                    style={{ objectFit: "contain" }}
                    className="z-0"
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-zinc-400 text-center p-4">
                    {address ? "No portrait found for this address" : "No address specified"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Address Information Outside Frame */}
        <div className="w-full text-sm text-zinc-400 text-center mb-2">
          Viewing portrait for address: {address || "No address specified"}
        </div>

        {/* Edit Controls - Only show for owner */}
        {isOwner && (
          <div className="w-full bg-zinc-800 p-4 rounded-lg">
            {isEditing || tempImageData ? (
              <>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe yourself for the portrait..."
                  className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 min-h-[100px] resize-none"
                  disabled={isGenerating || isSaving}
                />

                <div className="text-xs text-zinc-400 px-1">
                  <p>Try prompts like "a young adventurer with short brown hair and a green hat" or "a wise elder with flowing white beard and kind eyes"</p>
                </div>

                {error && (
                  <div className="text-red-500 text-sm p-2 bg-red-500/20 rounded-md">
                    {error}
                  </div>
                )}

                {tempImageData ? (
                  // If we have a generated image but not saved yet, show save/cancel options
                  <div className="flex gap-3">
                    <button
                      onClick={handleSavePortrait}
                      disabled={isSaving}
                      className={`mt-4 flex-1 p-3 ${isSaving ? 'bg-amber-700' : 'bg-amber-500'} text-zinc-900 font-medium rounded-md hover:bg-amber-400 transition-colors`}
                    >
                      {isSaving ? 'Saving...' : 'Save Portrait'}
                    </button>
                    <button
                      onClick={handleCancelGeneration}
                      disabled={isSaving}
                      className="mt-4 flex-1 p-3 bg-zinc-600 text-zinc-100 font-medium rounded-md hover:bg-zinc-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  // If we're editing but haven't generated yet
                  <div className="flex gap-3">
                    <button
                      onClick={handleGenerateImage}
                      disabled={isGenerating || !prompt.trim()}
                      className={`mt-4 flex-1 p-3 ${isGenerating ? 'bg-amber-700' : 'bg-amber-500'} text-zinc-900 font-medium rounded-md ${!prompt.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-400'} transition-colors`}
                    >
                      {isGenerating ? 'Generating...' : 'Generate Portrait'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="mt-4 flex-1 p-3 bg-zinc-600 text-zinc-100 font-medium rounded-md hover:bg-zinc-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Not in edit mode, show the Edit button
              <button
                onClick={() => setIsEditing(true)}
                className="w-full p-3 bg-amber-500 text-zinc-900 font-medium rounded-md hover:bg-amber-400 transition-colors"
              >
                {hasPortrait ? 'Edit Portrait' : 'Create Your Portrait'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Loading fallback component
function PortraitLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-zinc-900 to-black">
      <div className="w-full max-w-sm flex flex-col gap-4 items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
        <p className="text-zinc-400">Loading portrait...</p>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PortraitPage() {
  return (
    <Suspense fallback={<PortraitLoading />}>
      <ClientOnly>
        <UpProvider>
          <PortraitContent />
        </UpProvider>
      </ClientOnly>
    </Suspense>
  );
}