"use client";

import React, { useState, useCallback } from "react";
import { Upload, Film, Image, X, FileVideo } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function MediaUploader({ onFileSelect, selectedFile, onClear }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validTypes = ["video/mp4", "video/quicktime", "image/jpeg", "image/png", "image/webp"];
      if (validTypes.includes(file.type) || file.name.endsWith(".mp4") || file.name.endsWith(".mov")) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isVideo = selectedFile?.type.startsWith("video/") || selectedFile?.name.endsWith(".mp4") || selectedFile?.name.endsWith(".mov");

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 text-center cursor-pointer group",
            isDragging
              ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]"
              : "border-white/10 hover:border-white/20 bg-zinc-900/30 hover:bg-zinc-900/50"
          )}
          onClick={() => document.getElementById("media-upload-input")?.click()}
        >
          <input
            id="media-upload-input"
            type="file"
            accept=".mp4,.mov,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleFileInput}
          />

          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
              isDragging
                ? "bg-indigo-500/20 scale-110"
                : "bg-zinc-800 group-hover:bg-zinc-700"
            )}>
              {isDragging ? (
                <Upload className="w-8 h-8 text-indigo-400" />
              ) : (
                <FileVideo className="w-8 h-8 text-zinc-400" />
              )}
            </div>

            <div>
              <p className="text-lg font-medium text-zinc-200">
                {isDragging ? "Drop your file here" : "Drop your video or image here"}
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                or click to browse — MP4, MOV, JPG, PNG up to 500MB
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-600">
              <span className="flex items-center gap-1"><Film className="w-3.5 h-3.5" /> Video</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="flex items-center gap-1"><Image className="w-3.5 h-3.5" /> Image</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span>Up to 500MB</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                {isVideo ? (
                  <Film className="w-6 h-6 text-indigo-400" />
                ) : (
                  <Image className="w-6 h-6 text-indigo-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-zinc-200">{selectedFile.name}</p>
                <p className="text-sm text-zinc-500">{formatFileSize(selectedFile.size)} — {isVideo ? "Video" : "Image"}</p>
              </div>
            </div>
            <button
              onClick={onClear}
              className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}