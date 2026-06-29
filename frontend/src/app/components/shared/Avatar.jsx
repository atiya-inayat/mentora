"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

export default function Avatar({ src, name, size = "md", className = "" }) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const sizes = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-20 h-20",
    xl: "w-24 h-24",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  };

  const roundClasses = {
    sm: "rounded-full",
    md: "rounded-2xl",
    lg: "rounded-full",
    xl: "rounded-2xl",
  };

  const sizeClass = sizes[size] || sizes.md;
  const iconSize = iconSizes[size] || iconSizes.md;
  const roundClass = roundClasses[size] || roundClasses.md;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const imageSrc = src?.startsWith("http") ? src : `${baseUrl}${src}`;

  if (src && !error) {
    return (
      <img
        src={imageSrc}
        alt={name || "Avatar"}
        onError={() => setError(true)}
        className={`${sizeClass} ${roundClass} object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${roundClass} flex items-center justify-center bg-primary ${className}`}
    >
      <User className={`${iconSize} text-white`} />
    </div>
  );
}
