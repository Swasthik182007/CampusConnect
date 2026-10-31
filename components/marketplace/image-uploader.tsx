"use client";

import React, { useState, useRef } from "react";
import { Upload, X, ArrowLeft, ArrowRight, Image as ImageIcon, AlertCircle } from "lucide-react";
import { compressImage } from "@/lib/image-utils";
import { createClient } from "@/lib/supabase/client";

interface UploadedImageItem {
  id: string;
  url: string;
  file?: File;
  progress: number;
  error?: string;
}

interface ImageUploaderProps {
  userId: string;
  listingId: string;
  images: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  error?: string;
}

export function ImageUploader({
  userId,
  listingId,
  images,
  onChange,
  disabled = false,
  error,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingList, setUploadingList] = useState<UploadedImageItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: File[] = [];

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeBytes = 3 * 1024 * 1024; // 3 MB

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!allowedTypes.includes(f.type)) {
        setErrorMessage("Only JPEG, PNG, and WebP images are allowed.");
        return;
      }
      if (f.size > maxSizeBytes) {
        setErrorMessage(`"${f.name}" exceeds the 3 MB size limit.`);
        return;
      }
      validFiles.push(f);
    }

    if (images.length + validFiles.length > 5) {
      setErrorMessage("Maximum 5 images allowed per listing.");
      return;
    }

    // Process and upload each file
    const newItems: UploadedImageItem[] = validFiles.map((f, idx) => ({
      id: `${Date.now()}-${idx}`,
      url: URL.createObjectURL(f),
      file: f,
      progress: 10,
    }));

    setUploadingList((prev) => [...prev, ...newItems]);

    const uploadedUrls: string[] = [];

    for (const item of newItems) {
      if (!item.file) continue;

      try {
        // Compress image and strip EXIF
        const compressed = await compressImage(item.file, 1280, 0.8);

        // Upload to Supabase Storage if configured
        if (supabase && userId) {
          const ext = compressed.name.split(".").pop() || "webp";
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
          const filePath = `${userId}/${listingId}/${fileName}`;

          setUploadingList((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress: 60 } : i))
          );

          const { data: uploadRes, error: uploadErr } = await supabase.storage
            .from("listing-images")
            .upload(filePath, compressed, {
              cacheControl: "3600",
              upsert: true,
            });

          if (uploadErr) {
            console.warn("Storage upload error, using local object URL fallback:", uploadErr);
            uploadedUrls.push(item.url);
          } else {
            const { data: publicUrlData } = supabase.storage
              .from("listing-images")
              .getPublicUrl(filePath);

            uploadedUrls.push(publicUrlData.publicUrl);
          }
        } else {
          // Local demo preview fallback
          uploadedUrls.push(item.url);
        }

        setUploadingList((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, progress: 100 } : i))
        );
      } catch (err) {
        console.error("Image processing error:", err);
        uploadedUrls.push(item.url);
      }
    }

    // Append successful URLs to parent state
    onChange([...images, ...uploadedUrls].slice(0, 5));
    setUploadingList([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    if (disabled) return;
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0 || disabled) return;
    const updated = [...images];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleMoveRight = (index: number) => {
    if (index === images.length - 1 || disabled) return;
    const updated = [...images];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && images.length < 5 && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          disabled
            ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-60"
            : images.length >= 5
            ? "border-slate-200 bg-slate-50 cursor-default"
            : isDragging
            ? "border-indigo-600 bg-indigo-50/50 scale-[1.005]"
            : "border-slate-300 hover:border-indigo-500 hover:bg-slate-50/70 cursor-pointer"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={disabled || images.length >= 5}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-800">Click to upload</span> or drag and drop photos
          </div>
          <p className="text-[11px] text-slate-500">
            1 to 5 images • JPEG, PNG, or WebP • Max 3 MB per image
          </p>
          <span className="inline-block text-[11px] font-semibold text-indigo-600">
            {images.length}/5 uploaded
          </span>
        </div>
      </div>

      {(errorMessage || error) && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage || error}</span>
        </div>
      )}

      {/* Progress Bars for Uploading Items */}
      {uploadingList.length > 0 && (
        <div className="space-y-2">
          {uploadingList.map((item) => (
            <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Compressing & Uploading photo...</span>
                <span className="font-bold text-indigo-600">{item.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-200"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Thumbnails with Reorder and Cover Badge */}
      {images.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Uploaded Photos (First image is Cover):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 group shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />

                {idx === 0 && (
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[9px] uppercase tracking-wider shadow">
                    Cover
                  </span>
                )}

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveLeft(idx)}
                      title="Move earlier"
                      className="w-7 h-7 rounded-full bg-white/90 text-slate-800 flex items-center justify-center hover:bg-white"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    title="Remove photo"
                    className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveRight(idx)}
                      title="Move later"
                      className="w-7 h-7 rounded-full bg-white/90 text-slate-800 flex items-center justify-center hover:bg-white"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
