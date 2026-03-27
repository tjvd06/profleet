"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, X, GripVertical } from "lucide-react";

const MAX_IMAGES = 30;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/gif"];
const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp,.heic,.gif";

export interface ImageItem {
  id: string;
  file?: File;          // only for new uploads
  preview: string;      // object URL for new, or public URL for existing
  storagePath?: string;  // set for images already in Supabase Storage
}

interface ImageUploadProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) return;

      const validFiles = Array.from(files)
        .filter((f) => ACCEPTED_TYPES.includes(f.type))
        .slice(0, remaining);

      const newItems: ImageItem[] = validFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      }));

      onChange([...images, ...newItems]);
    },
    [images, onChange],
  );

  const removeImage = (id: string) => {
    const item = images.find((i) => i.id === id);
    if (item && !item.storagePath) URL.revokeObjectURL(item.preview);
    onChange(images.filter((i) => i.id !== id));
  };

  /* --- Drop zone for adding files --- */

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  /* --- Drag-and-drop reordering --- */

  const handleItemDragStart = (idx: number) => {
    setDragIdx(idx);
  };

  const handleItemDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleItemDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === dropIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const reordered = [...images];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dropIdx, 0, moved);
    onChange(reordered);
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const handleItemDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div className="space-y-4">
      {/* Counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">
          {images.length} von {MAX_IMAGES} Bilder hochgeladen
        </p>
        {images.length > 0 && (
          <p className="text-xs text-slate-400">Erstes Bild = Hauptbild. Per Drag & Drop umsortieren.</p>
        )}
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleItemDragStart(idx)}
              onDragOver={(e) => handleItemDragOver(e, idx)}
              onDrop={(e) => handleItemDrop(e, idx)}
              onDragEnd={handleItemDragEnd}
              className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${
                dragOverIdx === idx && dragIdx !== idx
                  ? "border-blue-500 scale-105 shadow-lg"
                  : idx === 0
                    ? "border-blue-400 ring-2 ring-blue-200"
                    : "border-slate-200"
              } ${dragIdx === idx ? "opacity-40" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.preview}
                alt={`Bild ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Main image badge */}
              {idx === 0 && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md">
                  Haupt
                </div>
              )}
              {/* Grip handle */}
              <div className="absolute top-1 right-7 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 text-white rounded-md p-0.5">
                  <GripVertical size={14} />
                </div>
              </div>
              {/* Delete button */}
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < MAX_IMAGES && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-slate-50/50 hover:border-blue-300 hover:bg-slate-50"
          }`}
        >
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <ImagePlus size={22} className="text-slate-400" />
          </div>
          <p className="font-semibold text-navy-950 text-sm mb-1">
            Bilder hierher ziehen oder klicken
          </p>
          <p className="text-xs text-slate-400">
            JPG, PNG, WebP, HEIC, GIF — max. {MAX_IMAGES - images.length} weitere
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
