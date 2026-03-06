"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const PLACEHOLDER = "/images/placeholder.png";

function isImageValid(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  defaultImage,
  className,
  loading,
  onClick,
}: {
  src?: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  defaultImage?: string;
  className?: string;
  loading?: "eagar"|"lazy";
  onClick?: () => void;
}) {
  const [imageSrc, setImageSrc] = useState(src || defaultImage || PLACEHOLDER);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (!imageSrc) return;
    isImageValid(imageSrc).then((valid) => {
      setImageSrc(valid ? imageSrc : defaultImage || PLACEHOLDER);
      setImageLoading(false);
    });
  }, [imageSrc, defaultImage]);

  return (
    <Image
      src={imageLoading ? "/loading.png" : imageSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      onClick={onClick}
      className={className}
      loading="lazy"
    />
  );
}