"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, Film, Image, FileVideo, X, Check, AlertCircle, Loader2 } from "lucide-react";

interface MediaUploaderProps {
  onUpload?: (files: File[]) => void;
  onFileSelect?: (file: File | null) => void;
  selectedFile?: File | null;
  onClear?: () => void;
  maxSizeMB?: number;
  accept?: string;
  multiple?: boolean;
}

export default function MediaUploader({ 
  onUpload, 
  onFileSelect,
  selectedFile: externalSelectedFile,
  onClear,
  maxSizeMB = 500, 
  accept = "video/mp4,video/quicktime,image/jpeg,image/png,image/webp,image/jpg", 
  multiple = true 
}: MediaUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAdd = useCallback((newFiles: FileList | File[]) => {
    setError(null);
    const valid: File[] = [];
    for (const f of Array.from(newFiles)) {
      if (f.size > maxSizeMB * 1024 * 1024) {
        setError(`"${f.name}" exceeds ${maxSizeMB}MB limit`);
        continue;
      }
      valid.push(f);
    }
    if (valid.length === 0) return;
    const combined = multiple ? [...files, ...valid] : valid;
    setFiles(combined);
    if (onUpload) onUpload(combined);
  }, [files, maxSizeMB, multiple, onUpload]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    validateAndAdd(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) validateAndAdd(e.target.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    // Simulate upload
    await new Promise(r => setTimeout(r, 1500));
    setUploading(false);
    setUploaded(true);
    setTimeout(() => setUploaded(false), 3000);
  };

  const isVideo = (name: string) => /\.(mp4|mov|avi|mkv|webm)$/i.test(name);
  const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          dragOver
            ? "border-gold bg-gold/5 shadow-lg shadow-gold/10"
            : "border-gray-200 hover:border-gold/50 hover:bg-gold/5"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-2">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            dragOver ? "bg-gold/20" : "bg-gray-100"
          }`}>
            {dragOver ? (
              <Upload className="w-5 h-5 text-gold" />
            ) : (
              <FileVideo className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-dark">
              {dragOver ? "Drop files here" : "Drop files or click to upload"}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Videos (MP4, MOV) or Images (JPG, PNG) — up to {maxSizeMB}MB
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-red-500 bg-red-50 rounded-lg p-2">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-warm-white rounded-lg p-2.5">
              <div className="w-7 h-7 rounded-md bg-gold/10 flex items-center justify-center shrink-0">
                {isVideo(f.name) ? <Film className="w-3.5 h-3.5 text-gold" /> : <Image className="w-3.5 h-3.5 text-gold" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-dark truncate">{f.name}</p>
                <p className="text-[10px] text-gray-400">{formatSize(f.size)}</p>
              </div>
              <button onClick={() => removeFile(i)} className="p-1 hover:bg-gray-200 rounded transition-colors">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          ))}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={uploading || uploaded}
            className={`w-full mt-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              uploaded
                ? "bg-green-500 text-white"
                : uploading
                  ? "bg-gray-200 text-gray-400"
                  : "bg-dark text-cream hover:bg-charcoal"
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
              </span>
            ) : uploaded ? (
              <span className="flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Uploaded!
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Upload {files.length} file{files.length > 1 ? "s" : ""}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}