import { useEffect, useRef, useCallback } from 'react';
import type { SliceInsets, FitResult } from '../types';
import { fitImageToContainer, renderCanvas } from '../utils/canvasHelpers';

interface CanvasRendererResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fitRef: React.RefObject<FitResult | null>;
}

export function useCanvasRenderer(
  image: HTMLImageElement | null,
  insets: SliceInsets,
): CanvasRendererResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fitRef = useRef<FitResult | null>(null);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const fit = fitImageToContainer(image.width, image.height, w, h);
    fitRef.current = fit;

    renderCanvas(ctx, image, insets, fit, w, h);
  }, [image, insets]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  // Redraw on resize
  useEffect(() => {
    const handleResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  return { canvasRef, fitRef };
}
