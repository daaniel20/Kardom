"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { GlobeAvatar } from "@/components/globe-avatar";
import { Link, useRouter } from "@/i18n/navigation";
import { directionFor } from "@/i18n/routing";
import {
  EVENT_IDS,
  MONTH_IDS,
  indexFromRotation,
  snapToStep,
  wrapDegrees,
  type EventId,
  type MonthId,
} from "@/lib/cycle";
import { cn } from "@/lib/utils";

const MONTH_STEP = 360 / MONTH_IDS.length;
const EVENT_STEP = 360 / EVENT_IDS.length;
const DRAG_GAIN = 1.25;
const CLICK_SLOP = 8;
// A shallow tilt keeps the month ring reading as a flat left-right ellipse.
const MONTH_TILT = -16;
// A shallow turn keeps the event ring reading as a tall top-bottom ellipse.
const EVENT_TILT = 28;

function dragDegrees(deltaPx: number, radius: number) {
  return (deltaPx / Math.max(radius, 1)) * (180 / Math.PI) * DRAG_GAIN;
}

function cycleLink(node: EventTarget | null) {
  if (!(node instanceof Element)) {
    return null;
  }
  const direct = node.closest("a[data-cycle-item]");
  if (direct) {
    return direct;
  }
  return node.querySelector(":scope > a[data-cycle-item]");
}

function frontness(rotation: number, index: number, step: number) {
  return Math.cos((wrapDegrees(rotation + index * step) * Math.PI) / 180);
}

export function CycleGlobe() {
  const t = useTranslations("Globe");
  const router = useRouter();
  const locale = useLocale();
  const direction = directionFor(locale);
  const eventSide = direction === "rtl" ? 1 : -1;

  const [monthRotation, setMonthRotation] = useState(0);
  const [eventRotation, setEventRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [radius, setRadius] = useState(230);

  const monthRef = useRef(0);
  const eventRef = useRef(0);
  const radiusRef = useRef(230);
  const stageRef = useRef<HTMLElement>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    function measure() {
      if (!stage) {
        return;
      }
      const next = Math.round(
        Math.min(280, Math.max(176, Math.min(stage.clientWidth, stage.clientHeight) * 0.32)),
      );
      if (next !== radiusRef.current) {
        radiusRef.current = next;
        setRadius(next);
      }
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  function commitMonth(value: number) {
    monthRef.current = value;
    setMonthRotation(value);
  }

  function commitEvent(value: number) {
    eventRef.current = value;
    setEventRotation(value);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0) {
      return;
    }
    suppressClickRef.current = false;
    const startX = event.clientX;
    const startY = event.clientY;
    const originMonth = monthRef.current;
    const originEvent = eventRef.current;
    const ringRadius = radiusRef.current;
    let moved = false;
    let axis: "x" | "y" | null = null;

    function chooseAxis(dx: number, dy: number) {
      if (axis) {
        return axis;
      }
      if (Math.hypot(dx, dy) <= CLICK_SLOP) {
        return null;
      }
      axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
      moved = true;
      return axis;
    }

    function move(pointerEvent: PointerEvent) {
      const dx = pointerEvent.clientX - startX;
      const dy = pointerEvent.clientY - startY;
      const chosen = chooseAxis(dx, dy);
      if (chosen === "x") {
        commitMonth(originMonth + dragDegrees(dx, ringRadius));
        setDragging(true);
      } else if (chosen === "y") {
        commitEvent(originEvent - dragDegrees(dy, ringRadius));
        setDragging(true);
      }
    }

    function end(pointerEvent: PointerEvent) {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      const dx = pointerEvent.clientX - startX;
      const dy = pointerEvent.clientY - startY;
      const chosen = chooseAxis(dx, dy);
      if (chosen === "x") {
        commitMonth(snapToStep(originMonth + dragDegrees(dx, ringRadius), MONTH_STEP));
      } else if (chosen === "y") {
        commitEvent(snapToStep(originEvent - dragDegrees(dy, ringRadius), EVENT_STEP));
      }
      setDragging(false);
      if (moved || pointerEvent.type === "pointercancel") {
        if (moved) {
          suppressClickRef.current = true;
        }
        return;
      }

      const link = cycleLink(pointerEvent.target) ?? cycleLink(
        document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY),
      );
      const id = link?.getAttribute("data-cycle-id");
      const kind = link?.getAttribute("data-cycle-item");
      if (!id || (kind !== "month" && kind !== "event")) {
        return;
      }
      suppressClickRef.current = true;
      router.push(kind === "month" ? `/month/${id}` : `/event/${id}`);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  const activeMonth = indexFromRotation(monthRotation, MONTH_IDS.length);
  const activeEvent = indexFromRotation(eventRotation, EVENT_IDS.length);
  const monthLabel = t(`months.${MONTH_IDS[activeMonth]}`);
  const eventLabel = t(`events.${EVENT_IDS[activeEvent]}`);
  const eventTilt = EVENT_TILT * eventSide;

  return (
    <section
      ref={stageRef}
      data-cycle-globe
      data-active-month={MONTH_IDS[activeMonth]}
      data-active-event={EVENT_IDS[activeEvent]}
      data-dragging={dragging ? "true" : "false"}
      aria-label={t("label")}
      onPointerDown={onPointerDown}
      className={cn(
        "absolute inset-0 touch-none select-none",
        dragging ? "cursor-grabbing" : "cursor-grab",
      )}
    >
      <p className="sr-only">{t("hint")}</p>
      <p className="sr-only" aria-live="polite">
        {t("selection", { month: monthLabel, event: eventLabel })}
      </p>

      <div className="absolute inset-0" style={{ perspective: "980px" }}>
        <div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: radius * 2.2,
              height: radius * 2.2,
              background:
                "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.95) 0%, rgba(212,236,251,0.72) 38%, rgba(159,208,242,0.28) 64%, rgba(159,208,242,0) 72%)",
              boxShadow:
                "inset 0 0 70px rgba(255,255,255,0.75), 0 28px 70px rgba(60,77,94,0.08)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-white/80"
            style={{
              width: radius * 2,
              height: radius * 2,
              transform: `translate(-50%, -50%) rotateX(${MONTH_TILT}deg)`,
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-white/70"
            style={{
              width: radius * 2,
              height: radius * 2,
              transform: `translate(-50%, -50%) rotateY(${eventTilt}deg)`,
            }}
          />

          <div
            data-month-ring
            className="cycle-ring pointer-events-none absolute inset-0"
            data-dragging={dragging ? "true" : "false"}
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateX(${MONTH_TILT}deg) rotateY(${monthRotation}deg)`,
            }}
          >
            {MONTH_IDS.map((id, index) => (
              <RingItem
                key={id}
                href={`/month/${id}`}
                label={t(`months.${id}`)}
                kind="month"
                id={id}
                active={index === activeMonth}
                depth={frontness(monthRotation, index, MONTH_STEP)}
                placement={`rotateY(${index * MONTH_STEP}deg) translateZ(${radius}px) translate(-50%, -50%)`}
                facing={`rotateY(${-(index * MONTH_STEP + monthRotation)}deg) rotateX(${-MONTH_TILT}deg)`}
                suppressClickRef={suppressClickRef}
              />
            ))}
          </div>

          <div
            data-event-ring
            className="cycle-ring pointer-events-none absolute inset-0"
            data-dragging={dragging ? "true" : "false"}
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateY(${eventTilt}deg) rotateX(${eventRotation}deg)`,
            }}
          >
            {EVENT_IDS.map((id, index) => (
              <RingItem
                key={id}
                href={`/event/${id}`}
                label={t(`events.${id}`)}
                kind="event"
                id={id}
                active={index === activeEvent}
                depth={frontness(eventRotation, index, EVENT_STEP)}
                placement={`rotateX(${index * EVENT_STEP}deg) translateZ(${radius}px) translate(-50%, -50%)`}
                facing={`rotateX(${-(index * EVENT_STEP + eventRotation)}deg) rotateY(${-eventTilt}deg)`}
                suppressClickRef={suppressClickRef}
              />
            ))}
          </div>

          <div
            className="pointer-events-none absolute left-1/2 top-1/2"
            style={{ transform: "translate(-50%, -50%) translateZ(0px)" }}
          >
            <GlobeAvatar label={t("avatarLabel")} />
          </div>
        </div>
      </div>
    </section>
  );
}

function RingItem({
  href,
  label,
  kind,
  id,
  active,
  depth,
  placement,
  facing,
  suppressClickRef,
}: {
  href: string;
  label: string;
  kind: "month" | "event";
  id: MonthId | EventId;
  active: boolean;
  depth: number;
  placement: string;
  facing: string;
  suppressClickRef: RefObject<boolean>;
}) {
  const scale = 0.74 + 0.3 * Math.max(depth, 0);
  const opacity = 0.42 + 0.58 * Math.max(depth, 0);
  const interactive = depth > 0.35;

  return (
    <div
      className="absolute top-1/2 left-1/2 w-max"
      style={{
        transformStyle: "preserve-3d",
        transform: placement,
        zIndex: Math.round((depth + 1) * 10),
        pointerEvents: "none",
      }}
    >
      <Link
        href={href}
        data-cycle-item={kind}
        data-cycle-id={id}
        data-front={active ? "true" : "false"}
        aria-current={active ? "true" : undefined}
        draggable={false}
        onClick={(event) => {
          if (!suppressClickRef.current) {
            return;
          }
          suppressClickRef.current = false;
          event.preventDefault();
        }}
        className={cn(
          "cycle-card block rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap shadow-[0_10px_24px_rgb(60_77_94/0.12)] backdrop-blur-md",
          active
            ? "border-white bg-white text-foreground ring-2 ring-primary"
            : "border-white/70 bg-white/60 text-foreground/85",
        )}
        style={{
          transform: `${facing} scale(${scale})`,
          opacity,
          pointerEvents: interactive ? "auto" : "none",
        }}
      >
        {label}
      </Link>
    </div>
  );
}
