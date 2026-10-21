"use client";

import { useState, useEffect } from "react";
import { Download, Smartphone, X, Share2, PlusSquare, MoreVertical, CheckCircle2 } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showGuide, setShowGuide] = useState<"ios" | "android" | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed / running in standalone mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isStandaloneMode);

    // Check device type
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);

    // Listen for Android / Chrome install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (isStandalone || dismissed) {
    return null; // Already running as installed standalone app or dismissed
  }

  // Only render on mobile devices (or desktop browsers with install event)
  if (!deferredPrompt && !isIOS && !isAndroid) {
    return null;
  }

  async function handleInstallClick() {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === "accepted") {
          setDeferredPrompt(null);
        }
      } catch (err) {
        setShowGuide("android");
      }
    } else if (isIOS) {
      setShowGuide("ios");
    } else if (isAndroid) {
      setShowGuide("android");
    }
  }

  return (
    <>
      {/* Floating or Embedded Install Pill */}
      <div className="w-full max-w-md mx-auto my-2.5 px-3 z-40">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-200/90 shadow-sm flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0 text-left">
              <div className="font-extrabold text-slate-900 leading-tight">Install InsightIQ App</div>
              <div className="text-[10px] text-slate-500 truncate">
                Add to Home Screen for fast mobile access
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 transition-all"
            >
              <Download className="w-3 h-3 stroke-[2.5]" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showGuide === "ios" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center relative animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setShowGuide(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Share2 className="w-7 h-7" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900">
              Install InsightIQ on iPhone
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Follow these 2 simple steps in Safari to add to your Home Screen:
            </p>

            <div className="mt-4 space-y-2.5 text-xs text-left text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tap the <strong>Share</strong> button at the bottom of Safari (<span className="text-orange-600 font-bold">Square with up arrow [↑]</span>).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-slate-600" />), then tap <strong>Add</strong>.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(null)}
              className="w-full mt-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-500/20"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Android Guide Modal (For HTTP / local connections where Chrome prompt requires manual step) */}
      {showGuide === "android" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center relative animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setShowGuide(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <MoreVertical className="w-7 h-7" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900">
              Install InsightIQ on Android
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add InsightIQ directly to your phone&apos;s home screen:
            </p>

            <div className="mt-4 space-y-2.5 text-xs text-left text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tap Chrome&apos;s <strong>three dots menu</strong> (<MoreVertical className="w-3.5 h-3.5 inline mx-0.5 text-slate-600" />) in the top-right corner.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Tap <strong>&quot;Add to Home screen&quot;</strong> or <strong>&quot;Install app&quot;</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </span>
                <span>
                  Tap <strong>Add / Install</strong>. InsightIQ will open as a standalone app!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(null)}
              className="w-full mt-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-500/20"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
