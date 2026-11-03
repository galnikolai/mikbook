"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  src?: string;
  srcs?: string[];
  schema?: boolean;
};

const DOUBLE_TAP_MS = 300;
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;

function clampZoom(value: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 100) / 100));
}

export function ChapterMedia({ src, srcs, schema = false }: Props) {
  const pages = srcs?.length ? srcs : src ? [src] : [];
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const lastTapRef = useRef(0);
  const pinchRef = useRef<{ startDist: number; startZoom: number } | null>(
    null,
  );
  const stack = pages.length > 1;

  const close = useCallback(() => {
    setOpen(false);
    setZoom(1);
  }, []);

  const setZoomClamped = useCallback((value: number) => {
    setZoom(clampZoom(value));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoom((z) => clampZoom(z + ZOOM_STEP));
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setZoom((z) => clampZoom(z - ZOOM_STEP));
      }
      if (e.key === "0") {
        e.preventDefault();
        setZoom(1);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (pages.length === 0) {
    return <aside className="chapter-media chapter-media--empty" aria-hidden />;
  }

  const openLightbox = () => {
    setZoom(1);
    setOpen(true);
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openLightbox();
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_MS) {
      e.preventDefault();
      openLightbox();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const onLightboxWheel = (e: React.WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((z) => clampZoom(z + delta));
  };

  const pinchDistance = (touches: React.TouchList) => {
    const [a, b] = [touches[0], touches[1]];
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.hypot(dx, dy);
  };

  const onLightboxTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchRef.current = {
        startDist: pinchDistance(e.touches),
        startZoom: zoom,
      };
    }
  };

  const onLightboxTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 2 || !pinchRef.current) return;
    e.preventDefault();
    const dist = pinchDistance(e.touches);
    const ratio = dist / pinchRef.current.startDist;
    setZoomClamped(pinchRef.current.startZoom * ratio);
  };

  const onLightboxTouchEnd = () => {
    if (pinchRef.current) pinchRef.current = null;
  };

  const mediaClass = [
    "chapter-media",
    schema ? "chapter-media--schema" : null,
    stack ? "chapter-media--stack" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const lightboxClass = [
    "image-lightbox",
    stack ? "image-lightbox--stack" : null,
    zoom > 1 ? "image-lightbox--zoomed" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <aside
        className={mediaClass}
        onDoubleClick={onDoubleClick}
        onTouchEnd={onTouchEnd}
        role="button"
        tabIndex={0}
        aria-label="Agrandir l'image"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox();
          }
        }}
      >
        {stack ? (
          pages.map((pageSrc, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={pageSrc}
              src={pageSrc}
              alt=""
              className="chapter-media__page"
              draggable={false}
              loading={i === 0 ? "eager" : "lazy"}
            />
          ))
        ) : (
          <Image
            src={pages[0]}
            alt=""
            fill
            priority
            sizes="(max-width: 900px) 100vw, 40vw"
            className="chapter-media__img"
            style={{
              objectFit: schema ? "contain" : "cover",
              objectPosition: "center top",
            }}
            draggable={false}
          />
        )}
      </aside>

      {open ? (
        <div
          className={lightboxClass}
          role="dialog"
          aria-modal="true"
          aria-label="Image plein écran"
          onClick={close}
          onWheel={onLightboxWheel}
          onTouchStart={onLightboxTouchStart}
          onTouchMove={onLightboxTouchMove}
          onTouchEnd={onLightboxTouchEnd}
        >
          <div
            className="image-lightbox__zoom"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="image-lightbox__zoom-btn"
              aria-label="Zoom out"
              disabled={zoom <= ZOOM_MIN}
              onClick={() => setZoomClamped(zoom - ZOOM_STEP)}
            >
              −
            </button>
            <input
              type="range"
              className="image-lightbox__zoom-range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={ZOOM_STEP}
              value={zoom}
              aria-label="Zoom"
              onChange={(e) => setZoomClamped(Number(e.target.value))}
            />
            <button
              type="button"
              className="image-lightbox__zoom-btn"
              aria-label="Zoom in"
              disabled={zoom >= ZOOM_MAX}
              onClick={() => setZoomClamped(zoom + ZOOM_STEP)}
            >
              +
            </button>
            <span className="image-lightbox__zoom-label">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div
            className="image-lightbox__stage"
            style={{ "--lightbox-zoom": String(zoom) } as React.CSSProperties}
            onClick={(e) => e.stopPropagation()}
          >
            {pages.map((pageSrc) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={pageSrc}
                src={pageSrc}
                alt=""
                className="image-lightbox__img"
                draggable={false}
                style={{
                  width: `min(${100 * zoom}vw - ${3 * zoom}rem, ${
                    (stack ? 900 : 1100) * zoom
                  }px)`,
                  maxWidth: "none",
                  maxHeight: "none",
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setZoom((z) => (z > 1 ? 1 : 2));
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
