"use client";

import { useSearchParams } from "next/navigation";
import { useState, useCallback, Suspense } from "react";
import Image from "next/image";
import { UpProvider, useUpProvider } from "../components/upProvider";

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
  const [imageUrl, setImageUrl] = useState("/assets/images/profile-default.svg"); 
  const [prompt, setPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  
  // Check if the user is the owner of this portrait
  const isOwner = walletConnected && address === connectedAddress;
  
  // Handle image generation
  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a description for your portrait");
      return;
    }
    
    try {
      setIsGenerating(true);
      setError("");
      
      const response = await fetch("/api/image", {
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
      
      // Set the generated image data
      setImageUrl(`data:image/webp;base64,${data.image}`);
      setIsEditing(false);
      
      // Mock saving to R2 and Postgres
      console.log(`Generated portrait for address ${address} with prompt: ${prompt}`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate image";
      setError(errorMessage);
      console.error("Error generating portrait:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, address]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-zinc-900 to-black">
      <div className="w-full max-w-sm flex flex-col gap-4">
        {/* Title Outside Frame */}
        <div className="w-full text-center">
          <h1 className="text-2xl font-bold text-zinc-100">
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
              {isGenerating ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
        
        {/* Address Information Outside Frame */}
        <div className="w-full text-sm text-zinc-400 text-center mb-2">
          Viewing portrait for address: {address || "No address specified"}
        </div>
        
        {/* Edit Controls - Completely Outside Frame */}
        {isOwner && (
          <div className="w-full bg-zinc-800 p-4 rounded-lg">
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe yourself or a character for your portrait..."
                  className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 min-h-[100px] resize-none"
                  disabled={isGenerating}
                />
                
                <div className="text-xs text-zinc-400 px-1">
                  <p>Try prompts like "a young adventurer with short brown hair and a green hat" or "a wise elder with flowing white beard and kind eyes"</p>
                </div>
                
                {error && (
                  <div className="text-red-500 text-sm p-2 bg-red-500/20 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGenerating}
                    className="flex-1 px-4 py-2 bg-amber-500 text-zinc-900 font-medium rounded-md hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? "Generating..." : "Generate Portrait"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setError("");
                    }}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-zinc-700 text-zinc-100 rounded-md hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 bg-amber-500 text-zinc-900 font-medium rounded-md hover:bg-amber-400 transition-colors"
              >
                Generate New Portrait
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
      <UpProvider>
        <PortraitContent />
      </UpProvider>
    </Suspense>
  );
}