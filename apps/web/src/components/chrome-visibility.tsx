"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const HiddenContext = createContext(false);
const SetHiddenContext = createContext<(hidden: boolean) => void>(() => {});

// Next.js's notFound() only replaces the content of the route segment it was
// called from — ancestor layouts (like (chrome)/layout.tsx, which renders
// SiteHeader/SiteFooter) keep rendering around it. This context lets a page
// that hits notFound() signal up to those ancestors to hide themselves too.
export function ChromeVisibilityProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  return (
    <SetHiddenContext.Provider value={setHidden}>
      <HiddenContext.Provider value={hidden}>{children}</HiddenContext.Provider>
    </SetHiddenContext.Provider>
  );
}

export function useChromeHidden() {
  return useContext(HiddenContext);
}

// Renders nothing; hides the surrounding chrome for as long as it's mounted.
export function HideChrome() {
  const setHidden = useContext(SetHiddenContext);
  useEffect(() => {
    setHidden(true);
    return () => setHidden(false);
  }, [setHidden]);
  return null;
}
