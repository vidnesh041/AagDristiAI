"use client";

import { useCallback, useEffect, useRef } from 'react';
import './ScrollExpand.css';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

const ScrollExpand = ({
  src = '',
  mediaType = 'image',
  poster = '',
  alt = '',
  title = '',
  scrollHint = '',
  startWidth = 52,
  startHeight = 52,
  startRadius = 24,
  endRadius = 16,
  mediaZoom = 1.25,
  scrollDistance = 1.4,
  holdDistance = 1.2,
  smoothing = 0.05,
  overlayScrim = 0.65,
  useWindowScroll = false,
  enabled = true,
  children,
  className = '',
  style,
  ...rest
}) => {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const mediaRef = useRef(null);
  const titleRef = useRef(null);
  const overlayRef = useRef(null);
  const scrimRef = useRef(null);
  const hintRef = useRef(null);

  const propsRef = useRef({});
  const dimensionsRef = useRef({
    effStartWidth: startWidth,
    effStartHeight: startHeight,
    effScrollDistance: scrollDistance,
    effHoldDistance: holdDistance,
  });

  propsRef.current = {
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled
  };

  const applyProgress = useCallback(p => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!frame || !media) return;
    const c = propsRef.current;
    const d = dimensionsRef.current;

    const e = smoothstep(0, 1, p);

    const w = d.effStartWidth + (100 - d.effStartWidth) * e;
    const h = d.effStartHeight + (100 - d.effStartHeight) * e;
    const ix = Math.max(0, (100 - w) / 2);
    const iy = Math.max(0, (100 - h) / 2);
    const r = c.startRadius + (c.endRadius - c.startRadius) * e;
    frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;

    media.style.transform = `scale(${c.mediaZoom + (1 - c.mediaZoom) * e})`;

    if (scrimRef.current) scrimRef.current.style.opacity = `${c.overlayScrim * e}`;

    if (titleRef.current) {
      const out = smoothstep(0.12, 0.55, p);
      titleRef.current.style.opacity = `${1 - out}`;
      titleRef.current.style.transform = `translate3d(0, ${-20 * out}px, 0) scale(${1 + 0.04 * out})`;
    }

    if (hintRef.current) {
      const gone = smoothstep(0, 0.15, p);
      hintRef.current.style.opacity = `${1 - gone}`;
      hintRef.current.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
    }

    if (overlayRef.current) {
      const inn = smoothstep(0.55, 0.95, p);
      overlayRef.current.style.opacity = `${inn}`;
      overlayRef.current.style.transform = `translate3d(0, ${20 * (1 - inn)}px, 0)`;
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;

    const reduceMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

    let raf = 0;
    let current = 0;
    let target = 0;
    let stageH = 0;
    let running = false;

    const measure = () => {
      const c = propsRef.current;
      const winW = typeof window !== 'undefined' ? window.innerWidth : 1024;

      // Dynamic screen size responsive parameters
      if (winW < 640) {
        dimensionsRef.current = {
          effStartWidth: Math.max(c.startWidth, 84),
          effStartHeight: Math.max(c.startHeight, 56),
          effScrollDistance: Math.min(c.scrollDistance, 0.7),
          effHoldDistance: Math.min(c.holdDistance, 0.3),
        };
      } else if (winW < 1024) {
        dimensionsRef.current = {
          effStartWidth: Math.max(c.startWidth, 68),
          effStartHeight: Math.max(c.startHeight, 52),
          effScrollDistance: Math.min(c.scrollDistance, 0.9),
          effHoldDistance: Math.min(c.holdDistance, 0.45),
        };
      } else {
        dimensionsRef.current = {
          effStartWidth: c.startWidth,
          effStartHeight: c.startHeight,
          effScrollDistance: c.scrollDistance,
          effHoldDistance: c.holdDistance,
        };
      }

      const d = dimensionsRef.current;
      const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
      stageH = c.useWindowScroll ? Math.max(460, Math.min(760, winH - 72)) : root.clientHeight;
      if (stageH <= 0) return;

      stage.style.height = `${stageH}px`;
      track.style.height = `${stageH * (1 + Math.max(0.3, d.effScrollDistance) + Math.max(0.2, d.effHoldDistance))}px`;

      const w = root.clientWidth || winW;
      stage.style.setProperty('--se-title-size', `${clamp(w * 0.045, 18, 52)}px`);
    };

    const readProgress = () => {
      const c = propsRef.current;
      const d = dimensionsRef.current;
      if (!c.enabled) return 1;
      const span = stageH * Math.max(0.01, d.effScrollDistance);
      if (c.useWindowScroll) {
        if (!trackRef.current) return 0;
        const top = trackRef.current.getBoundingClientRect().top;
        const offset = 64 - top;
        return clamp(offset / span, 0, 1);
      }
      return clamp(root.scrollTop / span, 0, 1);
    };

    const tick = () => {
      const c = propsRef.current;
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.0004) {
        current = target;
        running = false;
      }
      applyProgress(current);
      raf = running ? requestAnimationFrame(tick) : 0;
    };

    const kick = () => {
      if (running) return;
      running = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = readProgress();
      if (propsRef.current.smoothing <= 0 || reduceMotion) {
        current = target;
        applyProgress(current);
        return;
      }
      kick();
    };

    const onResize = () => {
      measure();
      target = readProgress();
      current = target;
      applyProgress(current);
    };

    measure();
    target = readProgress();
    current = target;
    applyProgress(current);

    const scroller = useWindowScroll ? window : root;
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(root);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
  }, [applyProgress, useWindowScroll]);

  const media =
    mediaType === 'video' ? (
      <video
        ref={mediaRef}
        className="scroll-expand__media"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
      />
    ) : (
      <img ref={mediaRef} className="scroll-expand__media" src={src} alt={alt} draggable={false} />
    );

  return (
    <div
      ref={rootRef}
      className={`scroll-expand ${useWindowScroll ? '' : 'scroll-expand--scroller'} ${className}`.trim()}
      style={style}
      {...rest}
    >
      <div ref={trackRef} className="scroll-expand__track">
        <div ref={stageRef} className="scroll-expand__stage">
          <div ref={frameRef} className="scroll-expand__frame">
            {media}
            <div ref={scrimRef} className="scroll-expand__scrim" />
            {title ? (
              <div ref={titleRef} className="scroll-expand__title">
                {title}
              </div>
            ) : null}
            {children ? (
              <div ref={overlayRef} className="scroll-expand__overlay">
                {children}
              </div>
            ) : null}
          </div>
          {scrollHint ? (
            <div ref={hintRef} className="scroll-expand__hint">
              {scrollHint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ScrollExpand;
