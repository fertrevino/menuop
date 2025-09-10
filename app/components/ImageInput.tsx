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
      // Prefer rear camera; add ideal as fallback for better browser compatibility
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Retry with simpler constraint if first attempt fails (some Android browsers)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = mediaStream;

      if (videoRef.current) {
        const videoEl = videoRef.current;
        videoEl.srcObject = mediaStream;
        // Ensure playsinline to avoid iOS full-screen takeover
        videoEl.setAttribute("playsinline", "true");
        // Wait for metadata for correct dimensions on iOS Safari
        const playPromise = new Promise<void>((resolve) => {
          videoEl.onloadedmetadata = () => {
            videoEl
              .play()
              .then(() => resolve())
              .catch(() => resolve());
          };
        });
        await playPromise;
      }

      setIsInitialized(true);
    } catch (error) {
      console.error("Camera init error", error);
      alert(
        "Camera not available. On some mobile browsers this feature may be blocked. Try using the Upload option instead."
      );
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
      } catch (error) {}
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
          <button
            onClick={close}
            className="text-gray-400 hover:text-white cursor-pointer"
            aria-label="Close camera"
          >
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
  itemDescription?: string; // (used only for AI prompt, not displayed)
}

// Icon components (outline, consistent with settings page aesthetic)
const CameraIcon = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9.5A2.5 2.5 0 015.5 7h1.382c.46 0 .9-.21 1.184-.57l.868-1.09A1.5 1.5 0 0110.382 5h3.236c.46 0 .9.21 1.184.57l.868 1.09c.284.36.724.57 1.184.57H18.5A2.5 2.5 0 0121 9.5v7A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-7z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15.5a3 3 0 100-6 3 3 0 000 6z"
    />
  </svg>
);

const UploadIcon = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 17a4 4 0 01-.88-7.903A5 5 0 0115.9 7.6 4.5 4.5 0 0117 16.9M12 12v7m0-7l-3 3m3-3l3 3"
    />
  </svg>
);

const SparkleIcon = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3l1.4 3.6a2 2 0 001 1l3.6 1.4-3.6 1.4a2 2 0 00-1 1L12 15l-1.4-3.6a2 2 0 00-1-1L6 9.999l3.6-1.4a2 2 0 001-1L12 3zM19 17l.7 1.8.3.7.7.3L23 20l-1.3-.8-.7-.3-.3-.7L19 17zM5 17l.7 1.8.3.7.7.3L9 20l-1.3-.8-.7-.3-.3-.7L5 17z"
    />
  </svg>
);

const EyeIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function ImageInput({
  value,
  onChange,
  placeholder = "Select an image using the buttons below",
  required = false,
  itemName,
  className = "",
  itemDescription,
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
  const cameraFileInputRef = useRef<HTMLInputElement>(null);

  // Simple mobile detection for fallback (getUserMedia issues on older iOS / embedded browsers)
  const isMobile =
    typeof window !== "undefined" &&
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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
      const suggestions = await getImageRecommendations(
        searchTerm,
        itemDescription || undefined,
        {
          maxResults: 4,
          useAI: true,
          style: "casual",
        }
      );
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

  // Reusable button style helpers (lightweight utility without external deps)
  const baseBtn =
    "inline-flex items-center gap-1 rounded-lg font-medium text-xs tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.97] cursor-pointer";
  const neutralBtn = "text-gray-400 hover:text-white";

  const sizeSm = "px-3 py-2"; // adjusted for larger icon
  const sizeMd = "px-4 py-2";

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
      {/* Mobile camera fallback: directly opens camera UI on many devices */}
      <input
        ref={cameraFileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            if (isMobile) {
              // Use native capture for better reliability
              cameraFileInputRef.current?.click();
            } else {
              setShowCamera(true);
            }
          }}
          disabled={isUploading}
          className={`${baseBtn} ${neutralBtn} ${sizeSm}`}
        >
          <CameraIcon />
          <span>Camera</span>
        </button>
        <button
          type="button"
          onClick={triggerFileUpload}
          disabled={isUploading}
          className={`${baseBtn} ${neutralBtn} ${sizeSm}`}
        >
          {isUploading ? (
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 border-2 border-current/40 border-t-current rounded-full animate-spin" />
              <span>Uploading...</span>
            </span>
          ) : (
            <>
              <UploadIcon />
              <span>Upload</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleAIGeneration}
          disabled={isGenerating}
          className={`${baseBtn} ${neutralBtn} ${sizeSm}`}
        >
          {isGenerating ? (
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 border-2 border-current/40 border-t-current rounded-full animate-spin" />
              <span>Generating...</span>
            </span>
          ) : (
            <>
              <SparkleIcon />
              <span>Auto Generate</span>
            </>
          )}
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
              className="text-gray-400 hover:text-white cursor-pointer"
              aria-label="Close AI images"
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
                          className="flex flex-col gap-2"
                          style={{ pointerEvents: "auto" }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImagePreview(suggestion);
                            }}
                            className={`${baseBtn} ${neutralBtn} ${sizeSm}`}
                          >
                            <EyeIcon />
                            <span className="font-normal">Preview</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAIImageSelect(suggestion.url);
                            }}
                            className={`${baseBtn} ${neutralBtn} ${sizeSm}`}
                          >
                            <CheckIcon />
                            <span className="font-normal">Select</span>
                          </button>
                        </div>
                      </div>
                    </div>
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
                className="text-gray-400 hover:text-white cursor-pointer"
                aria-label="Close image preview"
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
              {/* Removed visible alt/description text per requirement to only show images */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={closePreview}
                  className={`${baseBtn} ${neutralBtn} ${sizeMd}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAIImageSelect(previewImage.url)}
                  className={`${baseBtn} ${neutralBtn} ${sizeMd}`}
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
