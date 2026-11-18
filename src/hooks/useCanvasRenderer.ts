import { useEffect, useRef, useCallback, useState } from 'react';
import type { SliceInsets, FitResult } from '../types';
import { fitImageToContainer, renderCanvas } from '../utils/canvasHelpers';

interface CanvasRendererResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fit: FitResult | null;
}

function sameFit(prev: FitResult | null, next: FitResult): boolean {
  return (
    prev !== null &&
    prev.scale === next.scale &&
    prev.offsetX === next.offsetX &&
    prev.offsetY === next.offsetY &&
    prev.displayWidth === next.displayWidth &&
    prev.displayHeight === next.displayHeight
  );
}

export function useCanvasRenderer(
  image: HTMLImageElement | null,
  insets: SliceInsets,
): CanvasRendererResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fit, setFit] = useState<FitResult | null>(null);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;
    if (w < 1 || h < 1) return;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const next = fitImageToContainer(image.width, image.height, w, h);
    setFit((prev) => (sameFit(prev, next) ? prev : next));

    renderCanvas(ctx, image, insets, next, w, h);
  }, [image, insets]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const schedule = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(draw);
    };

    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [draw]);

  return { canvasRef, fit };
}
