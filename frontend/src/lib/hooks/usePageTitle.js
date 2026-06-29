"use client";

import { useEffect } from "react";

export default function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — Mentora` : "Mentora — Mentorship Marketplace";
    return () => {
      document.title = prev;
    };
  }, [title]);
}
