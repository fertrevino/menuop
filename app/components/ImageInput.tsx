"use client";

import React, { useState, useRef, useEffect } from "react";
import { isValidImageUrl, generateImageAlt } from "@/lib/utils/images";
import {
  getImageRecommendations,
  ImageSuggestion,
} from "@/lib/services/imageRecommendation";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";

// Simple Camera Capture Component
function CameraCapture({
  onCapture,
  onClose,
}: {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
  } else {
      }

      setIsInitialized(true);
    } catch (error) {
      alert("Failed to access camera");
      onClose();
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedPhoto(dataUrl);
  };

  const usePhoto = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
    }
    if (capturedPhoto) {
      onCapture(capturedPhoto);
    }
  };

  const retake = async () => {
    setCapturedPhoto(null);

    // Wait for React to re-render and mount the video element
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Force reconnection of video stream
    if (streamRef.current && videoRef.current) {

      // Clear current source first
      videoRef.current.srcObject = null;

      // Small delay to ensure disconnection
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Reconnect the stream
      videoRef.current.srcObject = streamRef.current;

      // Ensure video plays
      try {
        await videoRef.current.play();
      } catch (error) {
      }
    } else {
      // Try a few more times with delays
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (videoRef.current) {
          if (streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            await videoRef.current.play();
            return;
          }
        }
      }
      setIsInitialized(false);
      await startCamera();
    }
  };

  const close = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
    }
    onClose();
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h3 className="text-lg font-medium text-white">
            {capturedPhoto ? "Photo Preview" : "Take Photo"}
          </h3>
          <button onClick={close} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="p-4">
          {/* Camera View */}
          {!capturedPhoto && (
            <>
              {!isInitialized ? (
                <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-300">
                    <div className="animate-spin w-8 h-8 border-2 border-gray-400 border-t-white rounded-full mx-auto mb-2"></div>
                    <p>Starting camera...</p>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="w-full aspect-square object-cover rounded-lg"
                    autoPlay
                    playsInline
                    muted
                  />
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      onClick={close}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={takePhoto}
                      className="px-6 py-2 bg-[#1F8349] hover:bg-[#176e3e] text-white rounded-lg font-medium"
                    >
                      📸 Take Photo
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Photo Preview */}
          {capturedPhoto && (
            <>
              <img
                src={capturedPhoto}
                alt="Captured photo"
                className="w-full aspect-square object-cover rounded-lg"
              />
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={retake}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  🔄 Retake
                </button>
                <button
                  onClick={usePhoto}
                  className="px-6 py-2 bg-[#1F8349] hover:bg-[#176e3e] text-white rounded-lg font-medium"
                >
                  ✓ Use Photo
                </button>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}

interface ImageInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  itemName?: string;
  className?: string;
}

export default function ImageInput({
  value,
  onChange,
  placeholder = "Select an image using the buttons below",
  required = false,
  itemName,
  className = "",
}: ImageInputProps) {
  const [showAIImages, setShowAIImages] = useState(false);
  const [aiImages, setAiImages] = useState<ImageSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [previewImage, setPreviewImage] = useState<ImageSuggestion | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createSupabaseClient();

  function dataUrlToBlob(dataUrl: string): Blob {
    const [header, base64] = dataUrl.split(",");
    const mimeMatch = /data:(.*?);base64/.exec(header || "");
    const mime = mimeMatch?.[1] || "image/jpeg";
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  async function uploadToStorage(blob: Blob, preferredExt?: string) {
    const bucket = "menu-images"; // expects an existing public bucket with upload policy for authenticated users
    const extFromType = blob.type.split("/")[1] || "jpg";
    const ext = (preferredExt || extFromType || "jpg").toLowerCase();
    const filePath = `items/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        cacheControl: "3600",
        contentType: blob.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl as string;
  }

  const handleAIGeneration = async () => {
    setIsGenerating(true);
    setShowAIImages(true);

    try {
      // Use the itemName if available, otherwise fallback to generic food image
      const searchTerm = itemName && itemName.trim() ? itemName : "food image";
      const suggestions = await getImageRecommendations(searchTerm);
      setAiImages(suggestions);
    } catch (error) {
      alert("Failed to generate AI images. Please try again.");
      setShowAIImages(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIImageSelect = async (imageUrl: string) => {
    try {
      setIsUploading(true);

      // If the AI returned a base64 data URL, upload it to storage first
      if (imageUrl.startsWith("data:image/")) {
        const blob = dataUrlToBlob(imageUrl);
        const publicUrl = await uploadToStorage(blob);
        onChange(publicUrl);
      } else {
        // Otherwise, it's already a URL we can use directly
        onChange(imageUrl);
      }

      // Close suggestions/preview after successful selection
      setShowAIImages(false);
      setAiImages([]);
      setPreviewImage(null);
    } catch (err) {
      alert(
        "Failed to store the generated image. Please try again or choose another image."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleImagePreview = (suggestion: ImageSuggestion) => {
    setPreviewImage(suggestion);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const handleCameraCapture = (dataUrl: string) => {
    // Convert to Blob and upload to storage
    (async () => {
      try {
        setIsUploading(true);
        const blob = dataUrlToBlob(dataUrl);
        const publicUrl = await uploadToStorage(blob, "jpg");
        onChange(publicUrl);
      } catch (err) {
        alert(
          "Failed to upload photo. Please try again or choose a smaller image."
        );
      } finally {
        setIsUploading(false);
        setShowCamera(false);
      }
    })();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert("File size must be less than 5MB.");
      return;
    }

    // Upload to Supabase Storage to avoid embedding large base64 strings in the menu payload
    try {
      setIsUploading(true);
      const publicUrl = await uploadToStorage(file);
      onChange(publicUrl);
    } catch (err) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset the input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setShowCamera(true)}
          disabled={isUploading}
          className="text-xs bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 py-1 rounded-md transition-colors"
        >
          📷 Camera
        </button>

        <button
          type="button"
          onClick={triggerFileUpload}
          disabled={isUploading}
          className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded-md transition-colors"
        >
          {isUploading ? "Uploading..." : "📁 Upload"}
        </button>

        <button
          type="button"
          onClick={handleAIGeneration}
          disabled={isGenerating}
          className="text-xs bg-[#1F8349] hover:bg-[#176e3e] disabled:bg-gray-600 text-white px-3 py-1 rounded-md transition-colors"
        >
          {isGenerating ? "..." : "✨ Auto-generate"}
        </button>
      </div>

      {/* Image Preview */}
      {value && isValidImageUrl(value) && (
        <div className="mt-4">
          <img
            src={value}
            alt={generateImageAlt(value)}
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
            style={{
              maxWidth: "128px",
              maxHeight: "128px",
            }}
          />
        </div>
      )}

      {/* AI Image Suggestions - Inline */}
      {showAIImages && (
        <div className="mt-4 bg-gray-700 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between p-4 border-b border-gray-600">
            <h3 className="text-lg font-medium text-white">
              AI Generated Images
            </h3>
            <button
              onClick={() => {
                setShowAIImages(false);
                setAiImages([]);
              }}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="p-4">
            {isGenerating ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-[#1F8349] rounded-full"></div>
                <span className="ml-3 text-gray-300">
                  Generating AI images...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiImages.map((suggestion, index) => (
                  <div key={index} className="group">
                    <div
                      className="relative overflow-hidden rounded-lg border-2 border-gray-600 group-hover:border-[#1F8349] transition-colors"
                      style={{
                        backgroundColor: "#ffffff",
                        minHeight: "128px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={suggestion.url}
                        alt={suggestion.alt}
                        className="group-hover:scale-105 transition-transform duration-200"
                        style={{
                          width: "100%",
                          height: "128px",
                          objectFit: "cover",
                          display: "block",
                          backgroundColor: "#ffffff",
                          border: "none",
                          outline: "none",
                          opacity: "1",
                          visibility: "visible",
                          zIndex: "1",
                          position: "relative",
                        }}
                        onLoad={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.backgroundColor = "#ef4444";
                          target.style.color = "white";
                          target.style.display = "flex";
                          target.style.alignItems = "center";
                          target.style.justifyContent = "center";
                          target.style.fontSize = "12px";
                          target.alt = "Failed to load image";
                        }}
                      />
                      {/* Action buttons on hover */}
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          zIndex: "10",
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          pointerEvents: "none",
                        }}
                      >
                        <div
                          className="flex gap-2"
                          style={{ pointerEvents: "auto" }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImagePreview(suggestion);
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                          >
                            👁️ Preview
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAIImageSelect(suggestion.url);
                            }}
                            className="px-3 py-1 bg-[#1F8349] hover:bg-[#176e3e] text-white text-sm rounded-md transition-colors"
                          >
                            ✓ Select
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-400 text-center truncate">
                      {suggestion.alt}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h3 className="text-lg font-medium text-white">Image Preview</h3>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <div className="flex justify-center mb-4">
                <img
                  src={previewImage.url}
                  alt={previewImage.alt}
                  className="max-w-full max-h-96 object-contain rounded-lg"
                  style={{
                    backgroundColor: "#ffffff",
                    display: "block",
                  }}
                />
              </div>

              <p className="text-sm text-gray-300 text-center mb-4">
                {previewImage.alt}
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={closePreview}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAIImageSelect(previewImage.url)}
                  className="px-6 py-2 bg-[#1F8349] hover:bg-[#176e3e] text-white rounded-lg font-medium"
                >
                  ✓ Use This Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
