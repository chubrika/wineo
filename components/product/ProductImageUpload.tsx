"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { getPresignedUploadUrls } from "@/lib/api";

const MAX_IMAGES = 20;
const ACCEPT = { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] };

export type UploadedImage = {
  key: string;
  preview: string;
  uploading?: boolean;
  error?: string;
};

type ProductImageUploadProps = {
  token: string;
  value: UploadedImage[];
  onChange: (uploads: UploadedImage[]) => void;
  disabled?: boolean;
  maxFiles?: number;
};

/** Convert image file to JPEG blob for upload (R2 expects .jpg). */
async function toJpegBlob(file: File): Promise<Blob> {
  if (file.type === "image/jpeg") return file;
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
        "image/jpeg",
        0.9
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });
}

export function ProductImageUpload({
  token,
  value,
  onChange,
  disabled = false,
  maxFiles = MAX_IMAGES,
}: ProductImageUploadProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!token || files.length === 0) return;
      setUploadError(null);
      const current = [...value];
      const startIndex = current.length;
      if (startIndex + files.length > maxFiles) {
        setUploadError(`მაქსიმუმ ${maxFiles} სურათი.`);
        return;
      }

      const placeholders: UploadedImage[] = files.map((file) => ({
        key: "",
        preview: URL.createObjectURL(file),
        uploading: true,
      }));
      onChange([...current, ...placeholders]);

      try {
        const { uploads } = await getPresignedUploadUrls(token, files.length);
        const results: UploadedImage[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const { key, uploadUrl } = uploads[i];
          try {
            const blob = await toJpegBlob(file);
            const res = await fetch(uploadUrl, {
              method: "PUT",
              body: blob,
              headers: { "Content-Type": "image/jpeg" },
            });
            if (!res.ok) {
              throw new Error(`Upload failed: ${res.status}`);
            }
            results.push({
              key,
              preview: placeholders[i].preview,
              uploading: false,
            });
          } catch (err) {
            results.push({
              key: "",
              preview: placeholders[i].preview,
              uploading: false,
              error: err instanceof Error ? err.message : "Upload failed",
            });
          }
        }

        const withKeys = results.filter((r) => r.key);
        if (withKeys.length === 0) {
          setUploadError("სურათების ატვირთვა ვერ მოხერხდა.");
        }
        const next = [
          ...current,
          ...results.map((r) => ({
            key: r.key,
            preview: r.preview,
            uploading: false,
            error: r.error,
          })),
        ];
        onChange(next);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Presign failed");
        onChange(current);
        placeholders.forEach((p) => URL.revokeObjectURL(p.preview));
      }
    },
    [token, value, onChange, maxFiles]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (disabled) return;
      uploadFiles(acceptedFiles);
    },
    [disabled, uploadFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: maxFiles - value.length,
    maxSize: 10 * 1024 * 1024,
    disabled,
    onDropRejected: (rej) => {
      const msg = rej[0]?.errors[0]?.message;
      setUploadError(msg || "Invalid file");
    },
  });

  const removeAt = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    if (value[index].preview.startsWith("blob:")) {
      URL.revokeObjectURL(value[index].preview);
    }
    onChange(next);
    setUploadError(null);
  };

  const canAdd = value.length < maxFiles;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {value.map((img, i) => (
          <div
            key={img.key || img.preview}
            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100"
          >
            <Image
              src={img.preview}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-[var(--nav-link-active)] px-1.5 py-0.5 text-xs font-medium text-white">
                მთავარი
              </span>
            )}
            {img.uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-xs text-white">იტვირთება...</span>
              </div>
            )}
            {img.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-900/70 p-1">
                <span className="text-xs text-white">შეცდომა</span>
              </div>
            )}
            {!disabled && !img.uploading && (
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                aria-label="წაშლა"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
        {canAdd && (
          <div
            {...getRootProps()}
            className={`flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-sm transition-colors ${
              isDragActive
                ? "border-[var(--nav-link-active)] bg-[var(--nav-link-active)]/10"
                : "border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100"
            } ${disabled ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            <span className="text-zinc-500">+ სურათი</span>
          </div>
        )}
      </div>
      {uploadError && (
        <p className="text-sm text-red-600" role="alert">
          {uploadError}
        </p>
      )}
      <p className="text-xs text-zinc-500">
        პირველი სურათი გამოჩნდება როგორც მთავარი. მაქს. {maxFiles} სურათი, JPG/PNG/WebP.
      </p>
    </div>
  );
}

/** Return only R2 keys in order (first = thumbnail). */
export function getTempImageKeys(uploads: UploadedImage[]): string[] {
  return uploads.filter((u) => u.key && !u.error).map((u) => u.key);
}

/** Existing image URLs (items with no key = from server). Order preserved. */
export function getExistingImageUrls(uploads: UploadedImage[]): string[] {
  return uploads.filter((u) => !u.key && !u.error).map((u) => u.preview);
}
