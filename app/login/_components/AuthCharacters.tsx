"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// ─── Sub-component ────────────────────────────────────────────────────────────

interface EyeProps {
  /** Callback ref so parent collects all pupil elements for tracking */
  pupilRef: (el: HTMLDivElement | null) => void;
  /** Tailwind size classes for the white eye-white oval */
  className?: string;
  /** Additional inline styles (e.g. animation-delay for staggered blink) */
  style?: React.CSSProperties;
}

/** A single eye: white oval with a tracking pupil and CSS blink animation. */
function Eye({ pupilRef, className, style }: EyeProps) {
  return (
    <div
      className={cn(
        // The blink animation scales this element on Y — overflow-hidden clips correctly
        "animate-blink relative flex items-center justify-center overflow-hidden rounded-full bg-white",
        className
      )}
      style={style}
    >
      {/* Pupil — JS drives its transform; transition smooths rapid movements */}
      <div
        ref={pupilRef}
        className="h-2 w-2 rounded-full bg-[#111] will-change-transform"
        style={{ transition: "transform 90ms linear" }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * AuthCharacters — Client Component.
 *
 * Renders two abstract mascot characters (orange sphere, purple cube) whose
 * eyes follow the user's cursor. Blinking is driven by a CSS keyframe
 * (`animate-blink`) defined in globals.css — no JS timer needed.
 */
export default function AuthCharacters() {
  // One ref slot per pupil element (4 total: 2 per character)
  const pupilRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      pupilRefs.current.forEach((pupil, idx) => {
        if (!pupil) return;

        const eyeEl = pupil.parentElement;
        if (!eyeEl) return;

        const rect = eyeEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const angle = Math.atan2(dy, dx);

        // Orange eyes (idx 0-1) are narrower — cap at 2.5 px; purple (idx 2-3) at 3.5 px
        const maxDist = idx < 2 ? 2.5 : 3.5;
        const dist = Math.min(Math.hypot(dx, dy) * 0.08, maxDist);

        const x = (Math.cos(angle) * dist).toFixed(2);
        const y = (Math.sin(angle) * dist).toFixed(2);

        pupil.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  /** Returns a stable callback-ref setter for each pupil index. */
  const setPupilRef = (i: number) => (el: HTMLDivElement | null) => {
    pupilRefs.current[i] = el;
  };

  return (
    <div className="relative z-10 flex flex-col items-center gap-8">
      <div className="grid grid-cols-2 gap-6">
        {/* ── Orange sphere ── */}
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-gradient-to-br",
            "from-[#FF8B10] to-orange-700",
            "h-44 w-44 sm:h-48 sm:w-48",
            "shadow-[0_0_50px_rgba(255,139,16,0.45)]"
          )}
        >
          <div className="flex gap-3">
            <Eye pupilRef={setPupilRef(0)} className="h-6 w-4" />
            <Eye pupilRef={setPupilRef(1)} className="h-6 w-4" />
          </div>
        </div>

        {/* ── Purple cube — offset down so it peeks from behind the sphere ── */}
        <div
          className={cn(
            "flex translate-y-12 items-center justify-center rounded-2xl bg-gradient-to-tr",
            "from-[#5A189A] to-indigo-900",
            "h-44 w-44 sm:h-48 sm:w-48",
            "shadow-[0_0_50px_rgba(90,24,154,0.45)]"
          )}
        >
          <div className="flex gap-3">
            {/* Offset blink phase so the two characters don't blink in sync */}
            <Eye
              pupilRef={setPupilRef(2)}
              className="h-5 w-5"
              style={{ animationDelay: "1.6s" }}
            />
            <Eye
              pupilRef={setPupilRef(3)}
              className="h-5 w-5"
              style={{ animationDelay: "1.6s" }}
            />
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="mt-20 text-center">
        <h2 className="mb-2 text-4xl font-bold tracking-tight text-white">
          Construye mejor en tiempo real con OmniCode
        </h2>
      </div>
    </div>
  );
}
