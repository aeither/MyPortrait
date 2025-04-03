"use client";

import { useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import Image from "next/image";
import { useUpProvider } from "../../components/upProvider";

export default function PortraitPage() {
  const searchParams = useSearchParams();
  const { accounts, walletConnected } = useUpProvider();
  
  // Get address from URL params
  const addressParam = searchParams.get("address");
  const address = addressParam ? addressParam.toLowerCase() : null;
  
  // Get connected wallet address
  const connectedAddress = accounts.length > 0 
    ? accounts[0].toLowerCase() 
    : null;
  
  // State for image editing
  const [imageUrl, setImageUrl] = useState("/assets/images/profile-default.svg"); 
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Check if the user is the owner of this portrait
  const isOwner = walletConnected && address === connectedAddress;
  
  // Handle image save (mock implementation)
  const handleSaveImage = useCallback(() => {
    if (newImageUrl.trim()) {
      setImageUrl(newImageUrl);
      setIsEditing(false);
      setNewImageUrl("");
      
      // Mock saving to R2 and Postgres
      console.log(`Saved image URL ${newImageUrl} for address ${address}`);
      alert("Portrait saved successfully!");
    }
  }, [newImageUrl, address]);
  
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
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 z-10"></div>
              <Image 
                src={imageUrl} 
                alt="User Portrait" 
                fill 
                style={{ objectFit: "contain" }}
                className="z-0"
              />
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
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Enter new image URL"
                  className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveImage}
                    className="flex-1 px-4 py-2 bg-amber-500 text-zinc-900 font-medium rounded-md hover:bg-amber-400 transition-colors"
                  >
                    Save Portrait
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-zinc-700 text-zinc-100 rounded-md hover:bg-zinc-600 transition-colors"
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
                Edit Portrait
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}