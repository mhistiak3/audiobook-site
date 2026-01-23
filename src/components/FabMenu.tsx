"use client";

import { ListVideo, Plus, Video } from "lucide-react";
import { useEffect, useState } from "react";

interface FabMenuProps {
  onSelect: (option: "add-playlist" | "add-video") => void;
}

export default function FabMenu({ onSelect }: FabMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle mounting animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSelect = (option: "add-playlist" | "add-video") => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div
      className={`sticky bottom-[calc(var(--safe-bottom)+5rem)] right-0 z-50 flex flex-col items-end gap-3 transition-opacity duration-500 pr-4  ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Menu Options */}
      <div
        className={`flex flex-col gap-3 transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-50 opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <button
          onClick={() => handleSelect("add-video")}
          className="flex items-center gap-3 bg-light text-dark px-4 py-3 rounded-full shadow-lg hover:bg-primary-hover transition-colors group cursor-pointer"
        >
          <span className="font-bold text-sm">Add Video</span>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <Video size={16} className="text-light" />
          </div>
        </button>

        <button
          onClick={() => handleSelect("add-playlist")}
          className="flex items-center gap-3 bg-light text-dark px-4 py-3 rounded-full shadow-lg hover:bg-primary-hover transition-colors group cursor-pointer"
        >
          <span className="font-bold text-sm">Add Playlist</span>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <ListVideo size={16} className="text-light" />
          </div>
        </button>
      </div>

      {/* Main FAB */}
      <button
        onClick={toggleMenu}
        className={`w-14 h-14 bg-primary rounded-full shadow-xl flex items-center justify-center text-black hover:scale-105 transition-transform active:scale-95 cursor-pointer ${
          isOpen ? "rotate-45" : "rotate-0"
        }`}
        style={{
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        {isOpen ? <Plus size={28} /> : <Plus size={28} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[-1] backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
