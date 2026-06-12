"use client";

import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useDraftAnalyzer } from "@/hooks/useDraftAnalyzer";

// Monaco editor must be loaded dynamically (no SSR)
const EditorPanel = dynamic(() => import("@/components/EditorPanel"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center bg-zinc-900 text-zinc-500">
      <span className="text-sm">Loading editor...</span>
    </div>
  ),
});

/**
 * Inner component that has access to hooks.
 * Separated from the page export so dynamic import works correctly.
 */
function SpecPadApp() {
  // Activate the debounced draft analyzer
  useDraftAnalyzer(800);

  return (
    <>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <EditorPanel />
        <Sidebar />
      </div>
    </>
  );
}

export default function Home() {
  return <SpecPadApp />;
}
