"use client";

import { useEffect } from "react";

export function ThemeShortcut() {
  useEffect(() => {
    const root = document.documentElement;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    let overridden = false;

    const applyDevice = () => root.classList.toggle("dark", mql.matches);
    if (!overridden) applyDevice();

    const onMediaChange = () => {
      overridden = false;
      applyDevice();
    };
    mql.addEventListener("change", onMediaChange);

    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === "KeyL") {
        e.preventDefault();
        overridden = true;
        root.classList.toggle("dark");
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      mql.removeEventListener("change", onMediaChange);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}
