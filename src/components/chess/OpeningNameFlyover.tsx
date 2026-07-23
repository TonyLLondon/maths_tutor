"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type TransitionEvent,
} from "react";

const OPENING_HERO_MS = 2400;
const OPENING_FLY_MS = 900;

type OpeningNameFlyoverProps = {
  name: string;
  /** Shown when they have met this opening name before — encourages repetition. */
  practiceAgain?: boolean;
  boardSlotRef: RefObject<HTMLElement | null>;
  sidebarSlotRef: RefObject<HTMLElement | null>;
  onComplete: () => void;
};

function boardCenter(board: DOMRect) {
  return {
    x: board.left + board.width / 2,
    y: board.top + board.height / 2,
  };
}

export function OpeningNameFlyover({
  name,
  practiceAgain = false,
  boardSlotRef,
  sidebarSlotRef,
  onComplete,
}: OpeningNameFlyoverProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const [phase, setPhase] = useState<"hero" | "fly">("hero");
  const [transform, setTransform] = useState("");
  const [transitionOn, setTransitionOn] = useState(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onCompleteRef.current();
  };

  useLayoutEffect(() => {
    const board = boardSlotRef.current;
    const el = elRef.current;
    if (!board || !el) return;
    const { x, y } = boardCenter(board.getBoundingClientRect());
    setTransitionOn(false);
    setTransform(`translate(${x}px, ${y}px) translate(-50%, -50%) scale(1)`);
  }, [boardSlotRef, name]);

  useLayoutEffect(() => {
    if (phase !== "hero") return;
    const timer = window.setTimeout(() => setPhase("fly"), OPENING_HERO_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useLayoutEffect(() => {
    if (phase !== "fly") return;
    const board = boardSlotRef.current;
    const slot = sidebarSlotRef.current;
    const el = elRef.current;
    if (!board || !slot || !el) {
      finish();
      return;
    }

    const { x: cx, y: cy } = boardCenter(board.getBoundingClientRect());
    const slotR = slot.getBoundingClientRect();
    const tx = slotR.left + slotR.width / 2;
    const ty = slotR.top + slotR.height / 2;
    const scale = Math.min(
      1,
      Math.max(0.22, slotR.width / Math.max(el.offsetWidth, 1)),
    );

    setTransitionOn(false);
    setTransform(`translate(${cx}px, ${cy}px) translate(-50%, -50%) scale(1)`);

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setTransitionOn(true);
        setTransform(
          `translate(${tx}px, ${ty}px) translate(-50%, -50%) scale(${scale})`,
        );
      });
    });

    const fallback = window.setTimeout(() => {
      finish();
    }, OPENING_FLY_MS + 120);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
    };
  }, [phase, boardSlotRef, sidebarSlotRef]);

  const onTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "transform" || phase !== "fly") return;
    finish();
  };

  return (
    <div
      ref={elRef}
      className="pointer-events-none fixed left-0 top-0 z-100 max-w-[min(92vw,26rem)] rounded-2xl border-2 border-purple-400 bg-purple-50/98 px-6 py-4 text-center shadow-2xl ring-4 ring-purple-200/80 backdrop-blur-sm"
      style={{
        transform,
        transition: transitionOn
          ? `transform ${OPENING_FLY_MS}ms cubic-bezier(0.33, 1, 0.68, 1)`
          : "none",
      }}
      onTransitionEnd={onTransitionEnd}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-600">
        Opening
      </p>
      <p className="mt-1 text-2xl font-black leading-snug text-stone-900 sm:text-3xl">
        {name}
      </p>
      {practiceAgain ? (
        <p className="mt-2 text-sm font-medium text-purple-800">
          You&apos;re seeing this one again — keep going!
        </p>
      ) : null}
    </div>
  );
}
