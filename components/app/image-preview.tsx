"use client";

import { X } from "lucide-react";
import { SafeImage } from "@/components/app/safe-image";

interface ImagePreviewProps {
  open: boolean;
  imageUrl: string | null;
  onClose: () => void;
  tokenId?: string | number;
}

export function ImagePreview({
  open,
  imageUrl,
  onClose,
  tokenId,
}: ImagePreviewProps) {
  if (!open || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="relative w-[92vw] h-[92vh] max-w-400 select-none"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition backdrop-blur"
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Preview Badge */}
        <div className="absolute inset-0 z-30 flex items-start justify-center py-4 pointer-events-none">
          <div className="rounded-md bg-black/50 px-4 py-2 text-xs font-medium text-white tracking-wide backdrop-blur">
            DOCUMENT PREVIEW ONLY
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full h-full overflow-hidden">
          <SafeImage
            src={imageUrl}
            alt={tokenId ? `Token ${tokenId}` : "Document Preview"}
            fill
            className="object-contain pointer-events-none"
            defaultImage="/bond-placeholder.png"
          />
        </div>

        {/* Legal Disclaimer */}
        <div className="absolute bottom-4 inset-x-0 z-40 flex justify-center px-6">
          <div className="max-w-4xl rounded-md bg-black/60 px-4 py-3 text-center text-xs leading-relaxed text-white backdrop-blur">
            Disclaimer: This pawn ticket is shown for informational purposes only. Ownership and financial rights are determined by the corresponding blockchain token and its on-chain record.
          </div>
        </div>
      </div>
    </div>
  );
}