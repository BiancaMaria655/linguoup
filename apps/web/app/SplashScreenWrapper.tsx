"use client";

import { useEffect, useState } from "react";
import { SplashScreen } from "./SplashScreen";

const SPLASH_KEY = "linguoup_splash_shown";

export function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Only runs on client — safe to access sessionStorage
    const alreadyShown = sessionStorage.getItem(SPLASH_KEY);
    if (!alreadyShown) {
      setShowSplash(true);
    }
    setHydrated(true);
  }, []);

  function handleSplashDone() {
    sessionStorage.setItem(SPLASH_KEY, "true");
    setShowSplash(false);
  }

  if (!hydrated) {
    // Avoid hydration mismatch: render nothing until we know the client state
    return null;
  }

  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      {children}
    </>
  );
}
