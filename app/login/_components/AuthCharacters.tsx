"use client";

import { useState, useEffect, useRef } from "react";


export interface AuthCharactersProps {
  isTyping?: boolean;
  isPasswordVisible?: boolean;
  hasPassword?: boolean;
}

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

function EyeBall({
  size = 20,
  pupilSize = 8,
  maxDistance = 5,
  eyeColor = "white",
  pupilColor = "#111",
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!eyeRef.current) return;
      if (forceLookX !== undefined && forceLookY !== undefined) return;

      const rect = eyeRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(Math.hypot(dx, dy) * 0.08, maxDistance);

      setPupilPos({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
      });
    };

    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, [maxDistance, forceLookX, forceLookY]);

  const px = forceLookX !== undefined ? forceLookX : pupilPos.x;
  const py = forceLookY !== undefined ? forceLookY : pupilPos.y;

  return (
    <div
      ref={eyeRef}
      className="flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: isBlinking ? 2 : size,
        backgroundColor: eyeColor,
        overflow: "hidden",
        transition: "height 130ms ease-in-out, width 130ms ease-in-out",
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: pupilSize,
            height: pupilSize,
            backgroundColor: pupilColor,
            transform: `translate(${px.toFixed(2)}px, ${py.toFixed(2)}px)`,
            transition: "transform 100ms ease-out",
          }}
        />
      )}
    </div>
  );
}

function useBlink(initialDelay = 0): boolean {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    let blink: ReturnType<typeof setTimeout>;

    const schedule = () => {
      blink = setTimeout(
        () => {
          setIsBlinking(true);
          setTimeout(() => {
            setIsBlinking(false);
            schedule();
          }, 150);
        },
        Math.random() * 4000 + 3000,
      );
    };

    const init = setTimeout(schedule, initialDelay);
    return () => {
      clearTimeout(init);
      clearTimeout(blink);
    };
  }, [initialDelay]);

  return isBlinking;
}

export default function AuthCharacters({
  isTyping = false,
  isPasswordVisible = false,
  hasPassword = false,
}: AuthCharactersProps) {
  const orangeRef = useRef<HTMLDivElement>(null);
  const purpleRef = useRef<HTMLDivElement>(null);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const [orangeSkew, setOrangeSkew] = useState(0);
  const [purpleSkew, setPurpleSkew] = useState(0);

  const orangeBlinking = useBlink(0);
  const purpleBlinking = useBlink(1600); 

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const computeSkew = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (!ref.current) return 0;
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        return Math.max(-8, Math.min(8, -(e.clientX - cx) / 110));
      };
      setOrangeSkew(computeSkew(orangeRef));
      setPurpleSkew(computeSkew(purpleRef));
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useEffect(() => {
    if (!isTyping) return;
    const t1 = setTimeout(() => setIsLookingAtEachOther(true), 0);
    const t2 = setTimeout(() => setIsLookingAtEachOther(false), 950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isTyping]);

  useEffect(() => {
    if (!hasPassword || !isPasswordVisible) return;
    let t: ReturnType<typeof setTimeout>;
    const schedulePeek = () => {
      t = setTimeout(
        () => {
          setIsPurplePeeking(true);
          setTimeout(() => {
            setIsPurplePeeking(false);
            schedulePeek();
          }, 800);
        },
        Math.random() * 3000 + 2000,
      );
    };
    schedulePeek();
    return () => {
      clearTimeout(t);
      setIsPurplePeeking(false);
    };
  }, [hasPassword, isPasswordVisible]);


  const purpleHiding = hasPassword && !isPasswordVisible;
  const purpleRevealing = hasPassword && isPasswordVisible && isPurplePeeking;


  const orangeForce = isLookingAtEachOther ? { x: 5, y: 1 } : undefined;
  const purpleForce = purpleRevealing
    ? { x: 5, y: 6 }
    : purpleHiding
      ? { x: -4, y: -5 }
      : isLookingAtEachOther
        ? { x: -5, y: 1 }
        : undefined;

  return (
    <div className="relative z-10 flex flex-col items-center gap-8">
      <div
        className="relative flex items-end justify-center"
        style={{ width: 300, height: 250 }}
      >
        <div
          ref={orangeRef}
          className="absolute bottom-0 flex items-center justify-center rounded-full bg-linear-to-br from-noir-orange to-orange-700 shadow-[0_0_50px_rgba(255,139,16,0.45)]"
          style={{
            left: 0,
            width: 170,
            height: 170,
            transform: `skewX(${orangeSkew.toFixed(2)}deg)`,
            transformOrigin: "bottom center",
            transition: "transform 600ms ease-out",
          }}
        >
          <div className="flex gap-4">
            <EyeBall
              size={22}
              pupilSize={9}
              maxDistance={5}
              isBlinking={orangeBlinking}
              forceLookX={orangeForce?.x}
              forceLookY={orangeForce?.y}
            />
            <EyeBall
              size={22}
              pupilSize={9}
              maxDistance={5}
              isBlinking={orangeBlinking}
              forceLookX={orangeForce?.x}
              forceLookY={orangeForce?.y}
            />
          </div>
        </div>
        <div
          ref={purpleRef}
          className="absolute bottom-0 flex items-start justify-center rounded-2xl bg-linear-to-tr from-noir-purple-bright to-indigo-900 shadow-[0_0_50px_rgba(90,24,154,0.45)]"
          style={{
            right: 0,
            width: 150,
            height: purpleHiding ? 240 : 190,
            paddingTop: 22,
            transform: purpleHiding
              ? `skewX(${(purpleSkew - 10).toFixed(2)}deg) translateX(-14px)`
              : `skewX(${purpleSkew.toFixed(2)}deg)`,
            transformOrigin: "bottom center",
            transition: "height 700ms ease-in-out, transform 600ms ease-out",
          }}
        >
          <div className="flex gap-3">
            <EyeBall
              size={22}
              pupilSize={9}
              maxDistance={5}
              isBlinking={purpleBlinking}
              forceLookX={purpleForce?.x}
              forceLookY={purpleForce?.y}
            />
            <EyeBall
              size={22}
              pupilSize={9}
              maxDistance={5}
              isBlinking={purpleBlinking}
              forceLookX={purpleForce?.x}
              forceLookY={purpleForce?.y}
            />
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h2 className="mb-6 max-w-4xl text-xl font-black leading-tight tracking-tighter md:text-4xl">
          Construye mejor con
          <br />
          <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent md:text-6xl">
            OmniCode
          </span>
        </h2>

      </div>
    </div>


  );
}
