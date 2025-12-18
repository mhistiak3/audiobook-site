"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "default" | "danger";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus management and keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    // Focus the confirm button when dialog opens
    const timer = setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 100);

    // Handle Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    // Prevent body scroll when dialog is open
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleEscape);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onCancel]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  const confirmButtonClass =
    variant === "danger"
      ? "bg-error hover:bg-error/80 text-white"
      : "bg-primary hover:bg-primary-hover text-dark";

  return (
    <div
      className="fixed inset-0 z-70 flex items-end justify-center bg-black/70 animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-[480px] bg-secondary rounded-t-3xl p-6 pb-[calc(var(--safe-bottom)+1.5rem)] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3
            id="confirm-dialog-title"
            className="text-xl font-bold text-foreground"
          >
            {title}
          </h3>
          <button
            onClick={onCancel}
            className="text-muted hover:text-white transition-colors p-1"
            aria-label="Close dialog"
          >
            <X size={24} />
          </button>
        </div>

        {/* Message */}
        <p
          id="confirm-dialog-message"
          className="text-muted mb-6 text-base leading-relaxed"
        >
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-hover hover:bg-hover/80 text-foreground font-semibold rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 ${confirmButtonClass} font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black/50`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

