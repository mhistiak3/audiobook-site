"use client";

import { getApiKeyStatus } from "@/lib/apiKeyManager";
import { Key, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ApiKeyPrompt() {
  const [show, setShow] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await getApiKeyStatus();
      if (status.shouldPrompt) {
        setShow(true);
        setRequestCount(status.requestCount);
      }
    };

    checkStatus();

    // Check every minute for API status changes
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-[calc(var(--safe-top)+1rem)] left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] px-4 animate-slideDown">
      <div className="bg-primary/95 backdrop-blur-md border border-primary/50 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-dark/20 flex items-center justify-center shrink-0 mt-0.5">
            <Key size={20} className="text-dark" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-dark font-bold text-sm mb-1">
              Add Your Own API Key
            </h3>
            <p className="text-dark/90 text-xs mb-3 leading-relaxed">
              You&apos;ve made {requestCount} requests. To avoid rate limits and ensure uninterrupted service, please add your own YouTube API key in settings.
            </p>
            <div className="flex gap-2">
              <Link
                href="/settings"
                className="px-4 py-2 bg-dark text-primary font-semibold rounded-lg text-xs hover:bg-dark/90 transition-colors"
              >
                Go to Settings
              </Link>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-dark/10 text-dark font-semibold rounded-lg text-xs hover:bg-dark/20 transition-colors border border-dark/20"
              >
                Get API Key
              </a>
            </div>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-dark/60 hover:text-dark transition-colors p-1 shrink-0"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

