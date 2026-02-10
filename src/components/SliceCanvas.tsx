import { useCallback, useEffect, useRef, useState } from 'react';
import type { DragHandle, FitResult, SliceInsets } from '../types';
import { useCanvasRenderer } from '../hooks/useCanvasRenderer';
import { HANDLE_SIZE } from '../constants';

interface SliceCanvasProps {
  image: HTMLImageElement;
  insets: SliceInsets;
  setHInset: (v: number) => void;
  setVInset: (v: number) => void;
}

export function SliceCanvas({ image, insets, setHInset, setVInset }: SliceCanvasProps) {
  const { canvasRef, fitRef } = useCanvasRenderer(image, insets);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<DragHandle>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  // Update container rect on resize
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect());
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Also update when image changes
  useEffect(() => {
    if (containerRef.current) {
      setContainerRect(containerRef.current.getBoundingClientRect());
    }
  }, [image]);

  const fit = fitRef.current;

  const handlePointerDown = useCallback(
    (handle: DragHandle) => (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(handle);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !fit || !containerRect) return;

      const { scale, offsetX, offsetY, displayWidth, displayHeight } = fit;

      if (dragging === 'left' || dragging === 'right') {
        const relX = e.clientX - containerRect.left;
        let imageX: number;
        if (dragging === 'left') {
          imageX = (relX - offsetX) / scale;
        } else {
          imageX = (offsetX + displayWidth - relX) / scale;
        }
        setHInset(imageX);
      } else {
        const relY = e.clientY - containerRect.top;
        let imageY: number;
        if (dragging === 'top') {
          imageY = (relY - offsetY) / scale;
        } else {
          imageY = (offsetY + displayHeight - relY) / scale;
        }
        setVInset(imageY);
      }
    },
    [dragging, fit, containerRect, setHInset, setVInset],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Keyboard support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 1;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setHInset(insets.hInset - step);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setHInset(insets.hInset + step);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVInset(insets.vInset - step);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVInset(insets.vInset + step);
          break;
      }
    },
    [insets, setHInset, setVInset],
  );

  // Calculate handle positions
  const getHandleStyles = (fit: FitResult | null) => {
    if (!fit) return { left: {}, right: {}, top: {}, bottom: {} };
    const { scale, offsetX, offsetY, displayWidth, displayHeight } = fit;
    const hDisplay = insets.hInset * scale;
    const vDisplay = insets.vInset * scale;
    const half = HANDLE_SIZE / 2;

    return {
      left: {
        left: offsetX + hDisplay - half,
        top: offsetY,
        width: HANDLE_SIZE,
        height: displayHeight,
        cursor: 'col-resize' as const,
      },
      right: {
        left: offsetX + displayWidth - hDisplay - half,
        top: offsetY,
        width: HANDLE_SIZE,
        height: displayHeight,
        cursor: 'col-resize' as const,
      },
      top: {
        left: offsetX,
        top: offsetY + vDisplay - half,
        width: displayWidth,
        height: HANDLE_SIZE,
        cursor: 'row-resize' as const,
      },
      bottom: {
        left: offsetX,
        top: offsetY + displayHeight - vDisplay - half,
        width: displayWidth,
        height: HANDLE_SIZE,
        cursor: 'row-resize' as const,
      },
    };
  };

  const handles = getHandleStyles(fit);

  return (
    <div
      ref={containerRef}
      className="slice-canvas-container"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <canvas ref={canvasRef} className="slice-canvas" />
      {fit && (
        <>
          {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
            <div
              key={side}
              className={`slice-handle slice-handle-${side} ${dragging === side ? 'active' : ''}`}
              style={{
                position: 'absolute',
                ...handles[side],
              }}
              onPointerDown={handlePointerDown(side)}
            />
          ))}
        </>
      )}
      <div className="canvas-info">
        {image.width} x {image.height}px &mdash; Arrow keys: &plusmn;1px, Shift+Arrow: &plusmn;10px
      </div>
    </div>
  );
}
